import { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ResultStatus,
  Submission,
  Language,
  Problem,
  Role,
  Prisma
} from '@prisma/client'
import { AxiosRequestConfig } from 'axios'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { Span } from 'nestjs-otel'
import { testKey, userTestcasesKey } from '@libs/cache'
import {
  MIN_DATE,
  OPEN_SPACE_ID,
  TEST_SUBMISSION_EXPIRE_TIME
} from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ProblemRepository } from '@client/problem/problem.repository'
import {
  CreateSubmissionDto,
  Snippet,
  Template
} from './class/create-submission.dto'
import { SubmissionPublicationService } from './submission-pub.service'

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly problemRepository: ProblemRepository,
    private readonly publish: SubmissionPublicationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  @Span()
  async submitToProblem(
    submissionDto: CreateSubmissionDto,
    userIp: string,
    userId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }
    const submission = await this.createSubmission(
      submissionDto,
      problem,
      userId,
      userIp
    )

    if (submission) {
      this.logger.log(
        `Submission ${submission.id} is created for problem ${problem.id} by ip ${userIp}`
      )
      return submission
    }
  }

  @Span()
  async submitToContest(
    submissionDto: CreateSubmissionDto,
    userIp: string,
    userId: number,
    problemId: number,
    contestId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const now = new Date()

    // 진행 중인 대회인지 확인합니다.
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId,
        startTime: {
          lte: now
        },
        endTime: {
          gt: now
        }
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    // 대회에 등록되어 있는지 확인합니다.
    const contestRecord = await this.prisma.contestRecord.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId,
          userId
        }
      },
      select: {
        contest: {
          select: {
            groupId: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })
    if (!contestRecord) {
      throw new EntityNotExistException('ContestRecord')
    }
    if (contestRecord.contest.groupId !== groupId) {
      throw new EntityNotExistException('Contest')
    } else if (
      contestRecord.contest.startTime > now ||
      contestRecord.contest.endTime <= now
    ) {
      throw new ConflictFoundException(
        'Submission is only allowed to ongoing contests'
      )
    }

    const contestProblem = await this.prisma.contestProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          problemId,
          contestId
        }
      },
      include: {
        problem: true
      }
    })
    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }
    const { problem } = contestProblem

    const submission = await this.createSubmission(
      submissionDto,
      problem,
      userId,
      userIp,
      {
        contestId
      }
    )

    return submission
  }

  @Span()
  async submitToWorkbook(
    submissionDto: CreateSubmissionDto,
    userIp: string,
    userId: number,
    problemId: number,
    workbookId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const workbookProblem = await this.prisma.workbookProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          problemId,
          workbookId
        }
      },
      include: {
        problem: true
      }
    })
    if (!workbookProblem) {
      throw new EntityNotExistException('WorkbookProblem')
    }
    const { problem } = workbookProblem
    if (
      problem.groupId !== groupId ||
      problem.visibleLockTime.getTime() !== MIN_DATE.getTime()
    ) {
      throw new EntityNotExistException('Problem')
    }

    const submission = await this.createSubmission(
      submissionDto,
      problem,
      userId,
      userIp,
      {
        workbookId
      }
    )

    return submission
  }

  /**
   * 빈 제출 기록을 생성하고 채점 요청을 보냅니다.
   * @returns 생성된 제출 기록
   */
  @Span()
  async createSubmission(
    submissionDto: CreateSubmissionDto,
    problem: Problem,
    userId: number,
    userIp: string,
    idOptions?: { contestId?: number; workbookId?: number }
  ) {
    if (!problem.languages.includes(submissionDto.language)) {
      throw new ConflictFoundException(
        `This problem does not support language ${submissionDto.language}`
      )
    }
    const { code, ...data } = submissionDto
    if (
      !this.isValidCode(
        code,
        submissionDto.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ConflictFoundException('Modifying template is not allowed')
    }

    const submissionData = {
      code: code.map((snippet) => ({ ...snippet })), // convert to plain object
      result: ResultStatus.Judging,
      userId,
      userIp,
      problemId: problem.id,
      codeSize: new TextEncoder().encode(code[0].text).length,
      ...data
    }

    try {
      const submission = await this.prisma.submission.create({
        data: {
          ...submissionData,
          contestId: idOptions?.contestId,
          workbookId: idOptions?.workbookId
        }
      })

      await this.createSubmissionResults(submission)

      await this.publish.publishJudgeRequestMessage(code, submission)
      return submission
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new UnprocessableDataException('Failed to create submission')
      }
      throw error
    }
  }

  @Span()
  async createSubmissionResults(submission: Submission): Promise<void> {
    const testcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId: submission.problemId
      },
      select: { id: true }
    })

    await this.prisma.submissionResult.createMany({
      data: testcases.map((testcase) => {
        return {
          submissionId: submission.id,
          result: ResultStatus.Judging,
          problemTestcaseId: testcase.id
        }
      })
    })
  }

  isValidCode(code: Snippet[], language: Language, templates: Template[]) {
    const template = templates.find((code) => code.language === language)?.code
    if (!template || template.length === 0) return true

    if (template.length !== code.length) return false
    template.sort(this.snippetOrderCompare)
    code.sort(this.snippetOrderCompare)

    for (let i = 0; i < template.length; i++) {
      if (template[i].id !== code[i].id) return false
      else if (template[i].locked && template[i].text !== code[i].text)
        return false
    }
    return true
  }

  snippetOrderCompare(a: Snippet, b: Snippet) {
    if (a.id < b.id) {
      return -1
    } else if (a.id > b.id) {
      return 1
    }
    return 0
  }

  hash() {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  }

  async submitTest(
    userId: number,
    problemId: number,
    submissionDto: CreateSubmissionDto
  ) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      }
    })

    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    if (!problem.languages.includes(submissionDto.language)) {
      throw new ConflictFoundException(
        `This problem does not support language ${submissionDto.language}`
      )
    }
    const { code } = submissionDto
    if (
      !this.isValidCode(
        code,
        submissionDto.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ConflictFoundException('Modifying template is not allowed')
    }

    const testSubmission: Submission = {
      code: [],
      language: submissionDto.language,
      id: userId, // test용 submission끼리의 구분을 위해 submission의 id를 요청 User의 id로 지정
      problemId,
      result: 'Judging',
      score: 0,
      userId,
      userIp: null,
      contestId: null,
      workbookId: null,
      codeSize: null,
      createTime: new Date(),
      updateTime: new Date()
    }

    const rawTestcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId,
        isHidden: false
      }
    })

    const testcaseIds: number[] = []
    for (const rawTestcase of rawTestcases) {
      await this.cacheManager.set(
        testKey(userId, rawTestcase.id),
        { id: rawTestcase.id, result: 'Judging' },
        TEST_SUBMISSION_EXPIRE_TIME
      )
      testcaseIds.push(rawTestcase.id)
    }
    await this.cacheManager.set(userTestcasesKey(userId), testcaseIds)

    await this.publish.publishJudgeRequestMessage(
      submissionDto.code,
      testSubmission,
      true
    )
  }

  async getTestResult(userId: number) {
    const testCasesKey = userTestcasesKey(userId)
    const testcases =
      (await this.cacheManager.get<number[]>(testCasesKey)) ?? []

    const results: { id: number; result: ResultStatus; output?: string }[] = []
    for (const testcaseId of testcases) {
      const key = testKey(userId, testcaseId)
      const testcase = await this.cacheManager.get<{
        id: number
        result: ResultStatus
        output?: string
      }>(key)
      if (testcase) {
        results.push(testcase)
      }
    }
    return results
  }

  @Span()
  async checkDelay() {
    const baseUrl = this.configService.get(
      'RABBITMQ_API_URL',
      'http://127.0.0.1:15672/api'
    )

    const url =
      baseUrl +
      '/queues/' +
      this.configService.get('RABBITMQ_DEFAULT_VHOST') +
      '/' +
      this.configService.get('JUDGE_SUBMISSION_QUEUE_NAME')

    const config: AxiosRequestConfig = {
      method: 'GET',
      withCredentials: true,
      auth: {
        username: this.configService.get('RABBITMQ_DEFAULT_USER', ''),
        password: this.configService.get('RABBITMQ_DEFAULT_PASS', '')
      }
    }
    const res = await this.httpService.axiosRef(url, config)
    const threshold = 0.9

    if (res.status == 200) {
      if (res.data.consumer_capacity > threshold) return { isDelay: false }
      return { isDelay: true, cause: 'Judge server is not working.' }
    } else {
      return { isDelay: true, cause: 'RabbitMQ is not working.' }
    }
  }

  // FIXME: Workbook 구분
  @Span()
  async getSubmissions({
    problemId,
    groupId = OPEN_SPACE_ID,
    cursor = null,
    take = 10
  }: {
    problemId: number
    groupId?: number
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true,
        codeSize: true
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    const total = await this.prisma.submission.count({ where: { problemId } })

    return { data: submissions, total }
  }

  @Span()
  async getSubmission(
    id: number,
    problemId: number,
    userId: number,
    userRole: Role,
    groupId = OPEN_SPACE_ID,
    contestId: number | null
  ) {
    const now = new Date()
    let contest: {
      groupId: number
      startTime: Date
      endTime: Date
      isJudgeResultVisible: boolean
    } | null = null
    let isJudgeResultVisible: boolean | null = null

    if (contestId) {
      const contestRecord = await this.prisma.contestRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        },
        select: {
          contest: {
            select: {
              groupId: true,
              startTime: true,
              endTime: true,
              isJudgeResultVisible: true
            }
          }
        }
      })
      if (!contestRecord) {
        throw new EntityNotExistException('ContestRecord')
      }
      if (contestRecord.contest.groupId !== groupId) {
        throw new EntityNotExistException('Contest')
      }
      contest = contestRecord.contest
      isJudgeResultVisible = contest.isJudgeResultVisible
    }

    let problem
    if (!contestId) {
      problem = await this.prisma.problem.findFirst({
        where: {
          id: problemId,
          groupId,
          visibleLockTime: {
            equals: MIN_DATE // contestId가 없는 경우에는 공개된 문제인 경우에만 제출 내역을 가져와야 함
          }
        }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }
    } else {
      problem = await this.prisma.problem.findFirst({
        where: {
          id: problemId,
          groupId
        }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }
    }

    const submission = await this.prisma.submission.findFirst({
      where: {
        id,
        problemId,
        contestId
      },
      select: {
        userId: true,
        user: {
          select: {
            username: true
          }
        },
        language: true,
        code: true,
        createTime: true,
        result: true,
        submissionResult: true,
        codeSize: true
      }
    })
    if (!submission) {
      throw new EntityNotExistException('Submission')
    }

    if (
      contest &&
      contest.startTime <= now &&
      contest.endTime > now &&
      submission.userId !== userId &&
      userRole === Role.User
    ) {
      throw new ForbiddenAccessException(
        "Contest should end first before you browse other people's submissions"
      )
    }

    if (
      submission.userId === userId ||
      userRole === Role.Admin ||
      userRole === Role.SuperAdmin ||
      (await this.problemRepository.hasPassedProblem(userId, { problemId }))
    ) {
      const code = plainToInstance(Snippet, submission.code)
      const results = submission.submissionResult.map((result) => {
        return {
          ...result,
          // TODO: 채점 속도가 너무 빠른경우에 대한 수정 필요 (0ms 미만)
          cpuTime:
            result.cpuTime || result.cpuTime === BigInt(0)
              ? result.cpuTime.toString()
              : null
        }
      })

      results.sort((a, b) => a.problemTestcaseId - b.problemTestcaseId)

      if (contestId && !isJudgeResultVisible) {
        results.map((r) => {
          r.result = 'Blind'
          r.cpuTime = null
          r.memoryUsage = null
        })
      }

      return {
        problemId,
        username: submission.user?.username,
        code: code.map((snippet) => snippet.text).join('\n'),
        language: submission.language,
        createTime: submission.createTime,
        result:
          !contestId || (contestId && isJudgeResultVisible)
            ? submission.result
            : 'Blind',
        testcaseResult: results
      }
    }

    throw new ForbiddenAccessException(
      "You must pass the problem first to browse other people's submissions"
    )
  }

  @Span()
  async getContestSubmissions({
    problemId,
    contestId,
    userId,
    groupId = OPEN_SPACE_ID,
    cursor = null,
    take = 10
  }: {
    problemId: number
    contestId: number
    userId: number
    groupId?: number
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const isAdmin = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: 'Admin'
      }
    })

    if (!isAdmin) {
      const contestRecord = await this.prisma.contestRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        }
      })
      if (!contestRecord) {
        throw new EntityNotExistException('ContestRecord')
      }
    }

    const contestProblem = await this.prisma.contestProblem.findFirst({
      where: {
        problem: {
          id: problemId,
          groupId
        },
        contestId
      }
    })
    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }

    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId
      },
      select: {
        isJudgeResultVisible: true
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
    const isJudgeResultVisible = contest.isJudgeResultVisible

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId,
        contestId,
        userId: isAdmin ? undefined : userId // Admin 계정인 경우 자신이 생성한 submission이 아니더라도 조회가 가능
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true,
        codeSize: true
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    if (!isJudgeResultVisible) {
      submissions.map((submission) => (submission.result = 'Blind'))
    }

    const total = await this.prisma.submission.count({
      where: { problemId, contestId }
    })

    return { data: submissions, total }
  }
}
