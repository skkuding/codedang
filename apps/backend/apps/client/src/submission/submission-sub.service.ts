import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { Nack, AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import {
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import type { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import {
  testKey,
  testcasesKey,
  userTestKey,
  userTestcasesKey
} from '@libs/cache'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  RESULT_KEY,
  RESULT_QUEUE,
  RUN_MESSAGE_TYPE,
  Status,
  TEST_SUBMISSION_EXPIRE_TIME,
  USER_TESTCASE_MESSAGE_TYPE
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { JudgerResponse } from './class/judger-response.dto'

@Injectable()
export class SubmissionSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    this.amqpConnection.createSubscriber(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (msg: object, raw: any) => {
        try {
          const res = await this.validateJudgerResponse(msg)

          if (
            raw.properties.type === RUN_MESSAGE_TYPE ||
            raw.properties.type === USER_TESTCASE_MESSAGE_TYPE
          ) {
            const testRequestedUserId = res.submissionId // test용 submissionId == test를 요청한 userId
            await this.handleRunMessage(
              res,
              testRequestedUserId,
              raw.properties.type === USER_TESTCASE_MESSAGE_TYPE ? true : false
            )
            return
          }

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

  async handleRunMessage(
    msg: JudgerResponse,
    userId: number,
    isUserTest = false
  ): Promise<void> {
    const status = Status(msg.resultCode)
    const testcaseId = msg.judgeResult?.testcaseId
    const output = this.parseError(msg, status)
    if (!testcaseId) {
      const key = isUserTest ? userTestcasesKey(userId) : testcasesKey(userId)
      const testcaseIds = (await this.cacheManager.get<number[]>(key)) ?? []

      for (const testcaseId of testcaseIds) {
        await this.cacheManager.set(
          isUserTest
            ? userTestKey(userId, testcaseId)
            : testKey(userId, testcaseId),
          {
            id: testcaseId,
            // TODO: judgeResult 코드 처리 통합 해야함
            result: msg.judgeResult
              ? Status(msg.judgeResult.resultCode)
              : Status(msg.resultCode),
            output
          },
          TEST_SUBMISSION_EXPIRE_TIME
        )
      }
      return
    }

    const key = isUserTest
      ? userTestKey(userId, testcaseId)
      : testKey(userId, testcaseId)

    const testcase = await this.cacheManager.get<{
      id: number
      result: ResultStatus
      output?: string
    }>(key)
    if (testcase) {
      testcase.id = testcaseId
      // TODO: judgeResult 코드 처리 통합 해야함
      testcase.result = msg.judgeResult
        ? Status(msg.judgeResult.resultCode)
        : Status(msg.resultCode)
      testcase.output = output
    }

    await this.cacheManager.set(key, testcase, TEST_SUBMISSION_EXPIRE_TIME)
  }

  parseError(msg: JudgerResponse, status: ResultStatus): string {
    if (msg.judgeResult?.output) return msg.judgeResult.output

    switch (status) {
      case ResultStatus.CompileError:
        return msg.error ?? ''
      case ResultStatus.SegmentationFaultError:
        return 'Segmentation Fault'
      case ResultStatus.RuntimeError:
        return 'Value Error'
      default:
        return ''
    }
  }

  async validateJudgerResponse(msg: object): Promise<JudgerResponse> {
    const res: JudgerResponse = plainToInstance(JudgerResponse, msg)
    await validateOrReject(res)

    return res
  }

  @Span()
  async handleJudgerMessage(msg: JudgerResponse): Promise<void> {
    const status = Status(msg.resultCode)

    if (
      status === ResultStatus.ServerError ||
      status === ResultStatus.CompileError
    ) {
      await this.handleJudgeError(status, msg)
      return
    }

    if (!msg.judgeResult) {
      throw new UnprocessableDataException('judgeResult is empty')
    }

    const submissionResult = {
      submissionId: msg.submissionId,
      problemTestcaseId: msg.judgeResult.testcaseId,
      // TODO: judgeResult 코드 처리 통합 해야함
      result: Status(msg.judgeResult.resultCode),
      cpuTime: BigInt(msg.judgeResult.cpuTime),
      memoryUsage: msg.judgeResult.memory
    }

    await this.updateTestcaseJudgeResult(submissionResult)
  }

  @Span()
  async handleJudgeError(
    status: ResultStatus,
    msg: JudgerResponse
  ): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: {
        id: msg.submissionId,
        result: ResultStatus.Judging
      },
      select: {
        id: true
      }
    })

    // 이미 처리한 채점 예외에 대해서는 중복으로 처리하지 않음
    if (!submission) return

    await this.prisma.submission.update({
      where: {
        id: msg.submissionId
      },
      data: {
        result: status
      }
    })

    await this.prisma.submissionResult.updateMany({
      where: {
        submissionId: msg.submissionId
      },
      data: {
        result: status
      }
    })

    if (status === ResultStatus.ServerError)
      throw new UnprocessableDataException(
        `${msg.submissionId} ${msg.error} ${msg.judgeResult}`
      )
  }

  @Span()
  async updateTestcaseJudgeResult(
    submissionResult: Partial<SubmissionResult> &
      Pick<SubmissionResult, 'result' | 'submissionId'>
  ): Promise<void> {
    // TODO: submission의 값들이 아닌 submissionResult의 id 값으로 접근할 수 있도록 수정
    const { id } = await this.prisma.submissionResult.findFirstOrThrow({
      where: {
        submissionId: submissionResult.submissionId,
        problemTestcaseId: submissionResult.problemTestcaseId
      },
      select: {
        id: true
      }
    })

    await this.prisma.submissionResult.update({
      where: {
        id
      },
      data: {
        result: submissionResult.result,
        cpuTime: submissionResult.cpuTime,
        memoryUsage: submissionResult.memoryUsage
      }
    })

    await this.updateSubmissionResult(submissionResult.submissionId)
  }

  @Span()
  async updateSubmissionResult(submissionId: number): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: {
        id: submissionId,
        result: ResultStatus.Judging,
        submissionResult: {
          every: {
            NOT: {
              result: ResultStatus.Judging
            }
          }
        }
      },
      select: {
        id: true,
        problemId: true,
        userId: true,
        contestId: true,
        updateTime: true,
        submissionResult: {
          select: {
            result: true
          }
        }
      }
    })

    if (!submission) return

    const allAccepted = submission.submissionResult.every(
      (submissionResult) => submissionResult.result === ResultStatus.Accepted
    )

    const submissionResult = allAccepted
      ? ResultStatus.Accepted
      : (submission.submissionResult.find(
          (submissionResult) =>
            submissionResult.result !== ResultStatus.Accepted
        )?.result ?? ResultStatus.ServerError)

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { result: submissionResult }
    })

    if (submission.userId && submission.contestId)
      await this.calculateSubmissionScore(submission, allAccepted)

    await this.updateProblemScore(submission.id)
    await this.updateProblemAccepted(submission.problemId, allAccepted)
  }

  @Span()
  async calculateSubmissionScore(
    submission: Pick<
      Submission,
      'problemId' | 'contestId' | 'userId' | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    const contestId = submission.contestId!
    const userId = submission.userId!

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

    if (isAccepted) {
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

  async updateProblemScore(id: number) {
    const submission = await this.prisma.submission.findUniqueOrThrow({
      where: {
        id
      },
      select: {
        submissionResult: {
          select: {
            problemTestcase: true,
            result: true
          }
        }
      }
    })

    let score = 0
    submission.submissionResult.map((submissionResult) => {
      if (submissionResult.result === 'Accepted') {
        score += submissionResult.problemTestcase.scoreWeight
      }
    })

    await this.prisma.submission.update({
      where: {
        id
      },
      data: {
        score
      }
    })
  }

  @Span()
  async updateProblemAccepted(id: number, isAccepted: boolean): Promise<void> {
    const data: {
      submissionCount: { increment: number }
      acceptedCount?: { increment: number }
    } = {
      submissionCount: {
        increment: 1
      }
    }

    if (isAccepted) {
      data.acceptedCount = {
        increment: 1
      }
    }

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id
      }
    })

    await this.prisma.problem.update({
      where: {
        id
      },
      data: {
        ...data,
        acceptedRate: isAccepted
          ? (problem.acceptedCount + 1) / (problem.submissionCount + 1)
          : problem.acceptedCount / (problem.submissionCount + 1)
      }
    })
  }
}
