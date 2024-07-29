import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import {
  ResultStatus,
  type Submission,
  type SubmissionResult,
  type Language,
  type Problem,
  Role
} from '@prisma/client'
import type { AxiosRequestConfig } from 'axios'
import { plainToInstance } from 'class-transformer'
import { ValidationError, validateOrReject } from 'class-validator'
import { Span, TraceService } from 'nestjs-otel'
import {
  OPEN_SPACE_ID,
  Status,
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  PUBLISH_TYPE,
  RESULT_KEY,
  RESULT_QUEUE,
  SUBMISSION_KEY,
  MIN_DATE
} from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  type CreateSubmissionDto,
  Snippet,
  Template
} from './dto/create-submission.dto'
import { JudgeRequest } from './dto/judge-request.class'
import { JudgerResponse } from './dto/judger-response.dto'

@Injectable()
export class SubmissionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly traceService: TraceService
  ) {}
  onModuleInit() {
    this.amqpConnection.createSubscriber(
      async (msg: object) => {
        try {
          const res = await this.validateJudgerResponse(msg)
          await this.handleJudgerMessage(res)
        } catch (error) {
          if (
            Array.isArray(error) &&
            error.every((e) => e instanceof ValidationError)
          ) {
            this.logger.error(error, 'Message format error')
          } else if (error instanceof UnprocessableDataException) {
            this.logger.error(error, 'Iris exception')
          } else {
            this.logger.error(error, 'Unexpected error')
          }
          return new Nack()
        }
      },
      {
        exchange: EXCHANGE,
        routingKey: RESULT_KEY,
        queue: RESULT_QUEUE,
        queueOptions: {
          channel: CONSUME_CHANNEL
        }
      },
      ORIGIN_HANDLER_NAME
    )
  }

  @Span()
  async submitToProblem(
    submissionDto: CreateSubmissionDto,
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
    return await this.createSubmission(submissionDto, problem, userId)
  }

  @Span()
  async submitToContest(
    submissionDto: CreateSubmissionDto,
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

    return await this.createSubmission(submissionDto, problem, userId, {
      contestId
    })
  }

  @Span()
  async submitToWorkbook(
    submissionDto: CreateSubmissionDto,
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

    return await this.createSubmission(submissionDto, problem, userId, {
      workbookId
    })
  }

  @Span()
  async createSubmission(
    submissionDto: CreateSubmissionDto,
    problem: Problem,
    userId: number,
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
      await this.publishJudgeRequestMessage(code, submission)
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

      await this.publishJudgeRequestMessage(code, submission)
      return submission
    }

    if (idOptions.workbookId) {
      const submission = await this.prisma.submission.create({
        data: { ...submissionData, workbookId: idOptions.workbookId }
      })

      await this.publishJudgeRequestMessage(code, submission)
      return submission
    }
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

  @Span()
  async publishJudgeRequestMessage(code: Snippet[], submission: Submission) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        id: true,
        timeLimit: true,
        memoryLimit: true
      }
    })

    if (!problem) {
      throw new EntityNotExistException('problem')
    }

    const judgeRequest = new JudgeRequest(code, submission.language, problem)
    // TODO: problem 단위가 아닌 testcase 단위로 채점하도록 iris 수정

    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId: submission.id })

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submission.id),
      persistent: true,
      type: PUBLISH_TYPE
    })
    span.end()
  }

  async validateJudgerResponse(msg: object): Promise<JudgerResponse> {
    const res: JudgerResponse = plainToInstance(JudgerResponse, msg)
    await validateOrReject(res)

    return res
  }

  @Span()
  async handleJudgerMessage(msg: JudgerResponse) {
    const submissionId = parseInt(msg.submissionId)
    const resultStatus = Status(msg.resultCode)

    if (resultStatus === ResultStatus.ServerError) {
      await this.updateSubmissionResult(submissionId, resultStatus, [])
      throw new UnprocessableDataException(
        `${msg.submissionId} ${msg.error} ${msg.data}`
      )
    }

    // TODO: 컴파일 메시지 데이터베이스에 저장하기
    if (resultStatus === ResultStatus.CompileError) {
      await this.updateSubmissionResult(submissionId, resultStatus, [])
      return
    }

    const results = msg.data.judgeResult.map((result) => {
      return {
        problemTestcaseId: parseInt(result.testcaseId.split(':')[1], 10),
        result: Status(result.resultCode),
        cpuTime: BigInt(result.cpuTime),
        memoryUsage: result.memory
      }
    })

    await this.updateSubmissionResult(submissionId, resultStatus, results)
  }

  @Span()
  async updateSubmissionResult(
    id: number,
    resultStatus: ResultStatus,
    results: Array<
      Partial<SubmissionResult> &
        Pick<SubmissionResult, 'result' | 'cpuTime' | 'memoryUsage'>
    >
  ) {
    await Promise.all(
      results.map(
        async (result) =>
          await this.prisma.submissionResult.create({
            data: {
              submission: {
                connect: { id }
              },
              problemTestcase: {
                connect: { id: result.problemTestcaseId }
              },
              result: result.result,
              cpuTime: result.cpuTime,
              memoryUsage: result.memoryUsage
            }
          })
      )
    )

    // FIXME: 현재 코드는 message 하나에 특정 problem에 대한 모든 테스트케이스의 채점 결과가 전송된다고 가정하고, 이를 받아서 submission의 overall result를 업데이트합니다.
    //        테스트케이스별로 DB 업데이트가 이루어진다면 아래 코드를 수정해야 합니다.
    const submission = await this.prisma.submission.update({
      where: {
        id
      },
      data: {
        result: resultStatus
      }
    })

    if (
      resultStatus !== ResultStatus.Judging &&
      resultStatus !== ResultStatus.ServerError
    ) {
      const problem = await this.prisma.problem.findFirstOrThrow({
        where: {
          id: submission.problemId
        },
        select: {
          submissionCount: true,
          acceptedCount: true,
          acceptedRate: true
        }
      })
      const submissionCount = problem.submissionCount + 1
      const acceptedCount =
        resultStatus === ResultStatus.Accepted
          ? problem.acceptedCount + 1
          : problem.acceptedCount
      await this.prisma.problem.update({
        where: {
          id: submission.problemId
        },
        data: {
          submissionCount,
          acceptedCount,
          acceptedRate: acceptedCount / submissionCount
        }
      })
    }

    // contestId가 있는 경우에는 contestRecord 업데이트
    // participants들의 score와 penalty를 업데이트
    if (submission.userId && submission.contestId) {
      const contestId = submission.contestId
      const userId = submission.userId
      let toBeAddedScore = 0,
        toBeAddedPenalty = 0,
        toBeAddedAcceptedProblemNum = 0,
        isFinishTimeToBeUpdated = false
      const contestRecord = await this.prisma.contestRecord.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        },
        select: {
          id: true,
          acceptedProblemNum: true,
          score: true,
          totalPenalty: true,
          finishTime: true
        }
      })

      if (resultStatus === ResultStatus.Accepted) {
        toBeAddedScore = (
          await this.prisma.contestProblem.findFirstOrThrow({
            where: {
              contestId,
              problemId: submission.problemId
            },
            select: {
              score: true
            }
          })
        ).score
        isFinishTimeToBeUpdated = true
        toBeAddedAcceptedProblemNum = 1
      } else {
        toBeAddedPenalty = 1
      }

      await this.prisma.contestRecord.update({
        where: {
          id: contestRecord.id
        },
        data: {
          acceptedProblemNum:
            contestRecord.acceptedProblemNum + toBeAddedAcceptedProblemNum,
          score: contestRecord.score + toBeAddedScore,
          totalPenalty: contestRecord.totalPenalty + toBeAddedPenalty,
          finishTime: isFinishTimeToBeUpdated
            ? submission.updateTime
            : contestRecord.finishTime
        }
      })
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
    let contest: { groupId: number; startTime: Date; endTime: Date } | null =
      null

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
              endTime: true
            }
          }
        }
      })
      if (contestRecord.contest.groupId !== groupId) {
        throw new EntityNotExistException('contest')
      }
      contest = contestRecord.contest
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
          cpuTime: result.cpuTime.toString()
        }
      })

      return {
        problemId,
        username: submission.user?.username,
        code: code.map((snippet) => snippet.text).join('\n'),
        language: submission.language,
        createTime: submission.createTime,
        result: submission.result,
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

    const total = await this.prisma.submission.count({
      where: { problemId, contestId }
    })

    return { data: submissions, total }
  }
}
