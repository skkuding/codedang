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
            await this.handleRunMessage(
              res,
              res.submissionId,
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
    submissionId: number,
    isUserTest = false
  ): Promise<void> {
    const status = Status(msg.resultCode)
    const testcaseId = msg.judgeResult?.testcaseId
    const output = this.parseError(msg, status)

    // judgeResult 없음 => testcaseId 없음
    // CompileError 또는 ServerError 발생을 의미
    // 전체 테스트케이스 결과를 해당 에러로 저장하고 함수 종료
    if (!testcaseId) {
      const key = isUserTest
        ? userTestcasesKey(submissionId)
        : testcasesKey(submissionId)
      const testcaseIds = (await this.cacheManager.get<number[]>(key)) ?? []

      for (const testcaseId of testcaseIds) {
        await this.cacheManager.set(
          isUserTest
            ? userTestKey(submissionId, testcaseId)
            : testKey(submissionId, testcaseId),
          {
            id: testcaseId,
            result: status,
            output
          },
          TEST_SUBMISSION_EXPIRE_TIME
        )
      }
      return
    }

    const key = isUserTest
      ? userTestKey(submissionId, testcaseId)
      : testKey(submissionId, testcaseId)

    const testcase = await this.cacheManager.get<{
      id: number
      result: ResultStatus
      output?: string
    }>(key)
    if (testcase) {
      testcase.id = testcaseId
      testcase.result = status
      testcase.output = output
    }

    const cpuTime = BigInt(msg.judgeResult!.cpuTime)
    const memoryUsage = msg.judgeResult!.memory

    const testSubmission = await this.prisma.testSubmission.findUnique({
      where: { id: submissionId }
    })
    if (testSubmission) {
      const maxCpuTime = testSubmission.maxCpuTime || BigInt(0)
      const newMaxCpuTime =
        cpuTime > BigInt(maxCpuTime) ? cpuTime : BigInt(maxCpuTime)

      const maxMemoryUsage = testSubmission.maxMemoryUsage || 0
      const newMaxMemoryUsage =
        memoryUsage > maxMemoryUsage ? memoryUsage : maxMemoryUsage

      await this.prisma.testSubmission.update({
        where: { id: testSubmission.id },
        data: {
          maxCpuTime: newMaxCpuTime,
          maxMemoryUsage: newMaxMemoryUsage
        }
      })
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
      result: status,
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
        assignmentId: true,
        createTime: true,
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

    await this.updateProblemScore(submission.id)
    await this.updateProblemAccepted(submission.problemId, allAccepted)

    if (submission.userId) {
      if (submission.contestId)
        await this.updateContestRecord(submission, allAccepted)
      else if (submission.assignmentId)
        await this.calculateAssignmentSubmissionScore(submission, allAccepted)
    }
  }

  @Span()
  async updateContestRecord(
    submission: Pick<
      Submission,
      'problemId' | 'contestId' | 'userId' | 'createTime' | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    const { contestId, problemId, userId, createTime, updateTime } = submission

    if (!contestId || !userId)
      throw new UnprocessableDataException(
        `contestId: ${contestId}, userId: ${userId} is empty`
      )

    const _submissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        problemId,
        result: ResultStatus.Accepted
      },
      select: {
        id: true,
        userId: true,
        createTime: true
      }
    })

    const isNewAccept =
      _submissions.filter((submission) => submission.userId === userId)
        .length === 1

    if (!isNewAccept || !isAccepted) return

    // 재채점시 고려하여 만들었음.
    const isFirstSolver =
      _submissions.filter((submssion) => submssion.createTime < createTime)
        .length === 0

    const _contest = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId ?? -1
      },
      select: {
        startTime: true,
        penalty: true,
        lastPenalty: true,
        freezeTime: true,
        submission: {
          where: {
            userId
          },
          select: {
            id: true
          }
        }
      }
    })

    const contestProblem = await this.prisma.contestProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId,
          problemId
        }
      },
      select: {
        id: true,
        score: true
      }
    })

    const contestRecord = await this.prisma.contestRecord.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId,
          userId
        }
      },
      select: {
        id: true
      }
    })

    const { submission: submissions, ...contest } = _contest
    const { penalty, lastPenalty } = contest
    const { id: contestProblemId, score } = contestProblem
    const contestRecordId = contestRecord.id

    const submitCount = submissions.length
    const submitCountPenalty = Math.floor(penalty * (submitCount - 1))

    const submitTime = new Date(updateTime).getTime()
    const startTime = new Date(contest.startTime).getTime()
    const timePenalty = Math.floor((submitTime - startTime) / 60000)

    const isFreezed = contest.freezeTime && updateTime < contest.freezeTime
    await this.prisma.$transaction(async (prisma) => {
      await prisma.contestProblemRecord.upsert({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestProblemId_contestRecordId: {
            contestProblemId,
            contestRecordId
          }
        },
        update: {
          ...(!isFreezed
            ? {
                score,
                submitCountPenalty,
                timePenalty
              }
            : {}),
          finalScore: score,
          finalTimePenalty: timePenalty,
          finalSubmitCountPenalty: submitCountPenalty,
          isFirstSolver
        },
        create: {
          contestProblemId,
          contestRecordId,
          ...(!isFreezed
            ? {
                score,
                timePenalty,
                submitCountPenalty
              }
            : {}),
          finalScore: score,
          finalTimePenalty: timePenalty,
          finalSubmitCountPenalty: submitCountPenalty,
          isFirstSolver
        }
      })

      const contestProblemRecords = await prisma.contestProblemRecord.findMany({
        where: {
          contestRecordId
        },
        select: {
          score: true,
          timePenalty: true,
          submitCountPenalty: true,
          finalScore: true,
          finalTimePenalty: true,
          finalSubmitCountPenalty: true
        }
      })

      const [
        scoreSum,
        submitCountPenaltySum,
        timePenaltySum,
        maxTimePenalty,
        finalScoreSum,
        finalSubmitCountPenaltySum,
        finalTimePenaltySum,
        finalMaxTimePenalty
      ] = contestProblemRecords.reduce(
        (acc, record) => {
          acc[0] += record.score
          acc[1] += record.submitCountPenalty
          acc[2] += record.timePenalty
          acc[3] = Math.max(acc[3], record.timePenalty)
          acc[4] += record.finalScore
          acc[5] += record.finalSubmitCountPenalty
          acc[6] += record.finalTimePenalty
          acc[7] = Math.max(acc[7], record.finalTimePenalty)
          return acc
        },
        [0, 0, 0, 0, 0, 0, 0, 0]
      )

      const updatedData = {
        finalScore: finalScoreSum,
        finalTotalPenalty: lastPenalty
          ? finalMaxTimePenalty + finalSubmitCountPenaltySum
          : finalTimePenaltySum + finalSubmitCountPenaltySum,
        ...(!isFreezed && {
          score: scoreSum,
          totalPenalty: lastPenalty
            ? maxTimePenalty + submitCountPenaltySum
            : timePenaltySum + submitCountPenaltySum,
          lastAcceptedTime: updateTime
        })
      }

      await prisma.contestRecord.update({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { contestId_userId: { contestId, userId } },
        data: updatedData
      })
    })
  }

  @Span()
  async calculateAssignmentSubmissionScore(
    submission: Pick<
      Submission,
      'id' | 'problemId' | 'assignmentId' | 'userId' | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    const assignmentId = submission.assignmentId!
    const userId = submission.userId!

    let toBeAddedScore = 0,
      toBeAddedAcceptedProblemNum = 0
    // isFinishTimeToBeUpdated = false

    const assignmentRecord =
      await this.prisma.assignmentRecord.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId: {
            assignmentId,
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

    const submissionRecord = await this.prisma.submission.findUnique({
      where: {
        id: submission.id
      },
      select: {
        updateTime: true,
        score: true
      }
    })

    const totalScoreWeight = await this.prisma.problemTestcase.aggregate({
      where: {
        problemId: submission.problemId
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _sum: {
        scoreWeight: true
      }
    })

    const assignmentProblem = await this.prisma.assignmentProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_problemId: {
          assignmentId,
          problemId: submission.problemId
        }
      },
      select: {
        score: true
      }
    })

    const intTotalScoreWeight = Math.floor(
      totalScoreWeight._sum?.scoreWeight ?? assignmentProblem!.score
    )

    const submissionScore =
      submissionRecord!.score * (assignmentProblem!.score / intTotalScoreWeight)

    const assignmentProblemRecord =
      await this.prisma.assignmentProblemRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId_problemId: {
            assignmentId,
            userId,
            problemId: submission.problemId
          }
        },
        select: {
          score: true,
          isAccepted: true
        }
      })

    const prevSubmissionScore = assignmentProblemRecord?.score ?? 0

    await this.prisma.assignmentProblemRecord.upsert({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_userId_problemId: {
          assignmentId,
          userId,
          problemId: submission.problemId
        }
      },
      update: {
        score: submissionScore,
        isAccepted
      },
      create: {
        assignmentId,
        userId,
        problemId: submission.problemId,
        score: submissionScore,
        isSubmitted: true,
        isAccepted
      }
    })

    toBeAddedScore = submissionScore - prevSubmissionScore

    if (toBeAddedScore > 0) {
      // isFinishTimeToBeUpdated = true
      toBeAddedAcceptedProblemNum = isAccepted ? 1 : 0
    } else if (toBeAddedScore < 0) {
      // isFinishTimeToBeUpdated = true
      toBeAddedAcceptedProblemNum = assignmentProblemRecord?.isAccepted ? -1 : 0
    }
    await this.prisma.assignmentRecord.update({
      where: {
        id: assignmentRecord.id
      },
      data: {
        acceptedProblemNum:
          assignmentRecord.acceptedProblemNum + toBeAddedAcceptedProblemNum,
        score: assignmentRecord.score + toBeAddedScore,
        finishTime: submission.updateTime
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
