import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ResultStatus,
  type Submission,
  type Language,
  type Problem,
  Role
} from '@prisma/client'
import type { AxiosRequestConfig } from 'axios'
import { plainToInstance } from 'class-transformer'
import { Span } from 'nestjs-otel'
import { MIN_DATE, OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import {
  type CreateSubmissionDto,
  Snippet,
  Template
} from './class/create-submission.dto'
import type { TestcaseDTO } from './interface/testcase.dto'
import { SubmissionPublicationService } from './submission-pub.service'

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly storageService: StorageService,
    private readonly publish: SubmissionPublicationService
  ) {}

  @Span()
  async submitToProblem(
    submissionDto: CreateSubmissionDto,
    userIp: string,
    userId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })
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
    await this.prisma.contest.findFirstOrThrow({
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
    const { contest } = await this.prisma.contestRecord.findUniqueOrThrow({
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
    if (contest.groupId !== groupId) {
      throw new EntityNotExistException('Contest Not Found')
    } else if (contest.startTime > now || contest.endTime <= now) {
      throw new ConflictFoundException(
        'Submission is only allowed to ongoing contests'
      )
    }

    const { problem } = await this.prisma.contestProblem.findUniqueOrThrow({
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
    const { problem } = await this.prisma.workbookProblem.findUniqueOrThrow({
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
    if (
      problem.groupId !== groupId ||
      problem.visibleLockTime.getTime() !== MIN_DATE.getTime() // 공개된 problem이 아닐 때
    ) {
      throw new EntityNotExistException('problem')
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

    // idOptions Object가 undefined이거나 contestId와 workbookId가 모두 없는 경우
    if (
      idOptions === undefined ||
      (!idOptions.contestId && !idOptions.workbookId)
    ) {
      const submission = await this.prisma.submission.create({
        data: submissionData
      })

      await this.createSubmissionResults(submission)

      await this.publish.publishJudgeRequestMessage(code, submission)
      return submission
    }

    if (idOptions.contestId) {
      // 해당 contestId에 해당하는 Contest에서 해당 problemId에 해당하는 문제로 AC를 받은 submission이 있는지 확인
      const hasPassed = await this.hasPassedProblem(userId, {
        problemId: problem.id,
        contestId: idOptions.contestId
      })
      if (hasPassed) {
        throw new ConflictFoundException(
          'You have already gotten AC for this problem'
        )
      }
      const submission = await this.prisma.submission.create({
        data: { ...submissionData, contestId: idOptions.contestId }
      })

      await this.createSubmissionResults(submission)

      await this.publish.publishJudgeRequestMessage(code, submission)
      return submission
    }

    if (idOptions.workbookId) {
      const submission = await this.prisma.submission.create({
        data: { ...submissionData, workbookId: idOptions.workbookId }
      })

      await this.createSubmissionResults(submission)

      await this.publish.publishJudgeRequestMessage(code, submission)
      return submission
    }
  }

  @Span()
  async createSubmissionResults(submission: Submission): Promise<void> {
    const rawTestcase = await this.storageService.readObject(
      `${submission.problemId}.json`
    )

    const testcases = JSON.parse(rawTestcase) as TestcaseDTO[]

    await this.prisma.submissionResult.createMany({
      data: testcases.map((testcase) => {
        return {
          submissionId: submission.id,
          result: ResultStatus.Judging,
          problemTestcaseId: parseInt(testcase.id.split(':')[1], 10)
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

    await this.prisma.problem.findFirstOrThrow({
      where: {
        id: problemId,
        groupId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })

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
      const contestRecord = await this.prisma.contestRecord.findUniqueOrThrow({
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
      if (contestRecord.contest.groupId !== groupId) {
        throw new EntityNotExistException('contest')
      }
      contest = contestRecord.contest
      isJudgeResultVisible = contest.isJudgeResultVisible
    }

    if (!contestId) {
      await this.prisma.problem.findFirstOrThrow({
        where: {
          id: problemId,
          groupId,
          visibleLockTime: {
            equals: MIN_DATE // contestId가 없는 경우에는 공개된 문제인 경우에만 제출 내역을 가져와야 함
          }
        }
      })
    } else {
      await this.prisma.problem.findFirstOrThrow({
        where: {
          id: problemId,
          groupId
        }
      })
    }

    const submission = await this.prisma.submission.findFirstOrThrow({
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
      (await this.hasPassedProblem(userId, { problemId }))
    ) {
      const code = plainToInstance(Snippet, submission.code)
      const results = submission.submissionResult.map((result) => {
        return {
          ...result,
          cpuTime: result.cpuTime ? result.cpuTime.toString() : null
        }
      })

      results.sort((a, b) => a.problemTestcaseId - b.problemTestcaseId)

      if (contestId && !isJudgeResultVisible) {
        results.map((r) => (r.result = 'Blind'))
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
  async hasPassedProblem(
    userId: number,
    where: { problemId: number; contestId?: number }
  ): Promise<boolean> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        ...where,
        userId
      },
      select: { result: true }
    })

    return submissions.some(
      (submission) => submission.result === ResultStatus.Accepted
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
      await this.prisma.contestRecord.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        }
      })
    }

    await this.prisma.contestProblem.findFirstOrThrow({
      where: {
        problem: {
          id: problemId,
          groupId
        },
        contestId
      }
    })

    const isJudgeResultVisible = (
      await this.prisma.contest.findFirstOrThrow({
        where: {
          id: contestId
        },
        select: {
          isJudgeResultVisible: true
        }
      })
    ).isJudgeResultVisible

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
