import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import {
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import type { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { ValidationError, validateOrReject } from 'class-validator'
import { Span } from 'nestjs-otel'
import {
  testKey,
  testcasesKey,
  userTestKey,
  userTestcasesKey
} from '@libs/cache'
import {
  Status,
  TEST_SUBMISSION_EXPIRE_TIME,
  PERCENTAGE_SCALE,
  DECIMAL_PRECISION_FACTOR
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { MqttService } from '@libs/rabbitmq'
import { JudgerResponse } from './class/judger-response.dto'

@Injectable()
export class SubmissionSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mqttService: MqttService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    // MQTT 서비스에 메시지 핸들러를 등록
    this.mqttService.setMessageHandlers({
      onRunMessage: async (msg: object, isUserTest: boolean) => {
        try {
          const res = await this.validateJudgerResponse(msg)
          await this.handleRunMessage(res, res.submissionId, isUserTest)
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
          throw error // MQTT 서비스에서 Nack 처리
        }
      },
      onJudgeMessage: async (msg: object) => {
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
          throw error // MQTT 서비스에서 Nack 처리
        }
      }
    })
  }

  @Span()
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

  @Span()
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
      throw new UnprocessableDataException(
        'JudgeResult is missing for submission ${msg.submissionId} - cannot process judge response'
      )
    }

    const submissionResult = {
      submissionId: msg.submissionId,
      problemTestcaseId: msg.judgeResult.testcaseId,
      result: status,
      cpuTime: BigInt(msg.judgeResult.cpuTime),
      memoryUsage: msg.judgeResult.memory,
      output: msg.judgeResult.output
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
      Pick<SubmissionResult, 'result' | 'submissionId' | 'problemTestcaseId'>
  ): Promise<void> {
    await this.prisma.submissionResult.update({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        submissionId_problemTestcaseId: {
          submissionId: submissionResult.submissionId,
          problemTestcaseId: submissionResult.problemTestcaseId
        }
      },
      data: {
        result: submissionResult.result,
        cpuTime: submissionResult.cpuTime,
        memoryUsage: submissionResult.memoryUsage,
        output: submissionResult.output
      }
    })

    const invalidSubmissionStatuses: Array<ResultStatus> = [
      ResultStatus.Judging,
      ResultStatus.ServerError,
      ResultStatus.Blind,
      ResultStatus.Canceled
    ]
    if (
      invalidSubmissionStatuses.every(
        (result) => result !== submissionResult.result
      )
    ) {
      this.updateTestcaseStats(
        submissionResult.problemTestcaseId,
        submissionResult.result === ResultStatus.Accepted
      )
    }

    await this.updateSubmissionResult(submissionResult.submissionId)
  }

  @Span()
  async updateTestcaseStats(
    testcaseId: number,
    isAccepted: boolean
  ): Promise<void> {
    const testcaseStats = {
      where: {
        id: testcaseId
      },
      data: {
        submissionCount: {
          increment: 1
        },
        acceptedCount: {
          increment: 0
        }
      }
    }

    if (isAccepted) {
      testcaseStats.data.acceptedCount.increment = 1
    }

    await this.prisma.problemTestcase.update(testcaseStats)
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
            result: true,
            problemTestcaseId: true
          }
        },
        contest: {
          select: {
            evaluateWithSampleTestcase: true
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
            submissionResult.result !== ResultStatus.Accepted &&
            submissionResult.result !== ResultStatus.Canceled
        )?.result ?? ResultStatus.ServerError)

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { result: submissionResult }
    })

    await this.updateSubmissionScore(submission.id)
    await this.updateProblemAccepted(submission.problemId, allAccepted)

    if (submission.userId) {
      if (submission.contestId)
        await this.updateContestRecord(submission, allAccepted)
      else if (submission.assignmentId)
        await this.calculateAssignmentSubmissionScore(submission, allAccepted)
    }
  }

  /**
   * 업데이트된 제출 결과를 반영하여 대회 참가자의 점수 및 패널티를 갱신하는 함수
   *
   * @param {Pick<Submission, 'problemId' | 'contestId' | 'userId' | 'createTime' | 'updateTime'>} submission
   *   - 제출 정보 객체 (문제 ID, 대회 ID, 사용자 ID, 제출 생성 및 수정 시간 포함)
   * @param {boolean} isAccepted
   *   - 제출 결과가 `Accepted`인지 여부
   * @throws {UnprocessableDataException}
   *   - `contestId` 또는 `userId`가 없는 경우 예외 발생
   * @returns {Promise<void>}
   *   - 이 함수는 반환값이 없으며, 대회 참가자의 점수 및 패널티를 업데이트한다.
   *
   * @description
   * 이 함수는 대회에서 새로운 `Accepted` 제출이 발생했을 때 해당 참가자의 점수 및 패널티를 업데이트하는 역할을 합니다.
   *
   * **주요 동작 흐름:**
   * 1. `contestId`와 `userId`가 없으면 예외를 발생시킵니다.
   * 2. 제출된 문제에 대한 기존 `Accepted` 제출을 조회하여 **새로운 Accepted 제출인지 확인**합니다.
   * 3. 참가자가 **이 문제의 첫 번째 해결자인지 확인**하고, 맞다면 `contestProblemFirstSolver`에 기록합니다.
   * 4. 대회 및 문제 정보를 조회하여 점수 및 패널티 계산에 필요한 데이터를 가져옵니다.
   * 5. **패널티 계산:**
   *    - `submitCountPenalty`: 제출 횟수에 따른 패널티
   *    - `timePenalty`: 제출 시간에 따른 패널티 (대회 시작 시간과 비교)
   * 6. 점수를 업데이트할 때 `freezeTime`을 고려하여 공개 여부를 결정합니다.
   * 7. `contestProblemRecord`를 `upsert()`하여 참가자의 문제 해결 기록을 갱신합니다.
   * 8. 참가자의 전체 점수를 다시 계산하고, `contestRecord`에 반영합니다.
   */
  @Span()
  async updateContestRecord(
    submission: Pick<
      Submission,
      'problemId' | 'contestId' | 'userId' | 'createTime' | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    const { contestId, problemId, userId, updateTime } = submission

    if (!contestId || !userId)
      throw new UnprocessableDataException(
        `Contest record update failed - missing required fields: contestId=${contestId}, userId=${userId}`
      )

    const [contest, contestProblem, contestRecord, submissions] =
      await Promise.all([
        this.prisma.contest.findUniqueOrThrow({
          where: { id: contestId },
          select: {
            startTime: true,
            penalty: true,
            lastPenalty: true,
            freezeTime: true,
            submission: { where: { userId, problemId }, select: { id: true } }
          }
        }),
        this.prisma.contestProblem.findUniqueOrThrow({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { contestId_problemId: { contestId, problemId } },
          select: { id: true, score: true }
        }),
        this.prisma.contestRecord.findUniqueOrThrow({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { contestId_userId: { contestId, userId } },
          select: { id: true }
        }),
        this.prisma.submission.findMany({
          where: { contestId, problemId, result: ResultStatus.Accepted },
          select: { id: true, userId: true, createTime: true }
        })
      ])

    const isNewAccept =
      submissions.filter((sub) => sub.userId === userId).length === 1
    if (!isNewAccept || !isAccepted) return

    const { startTime, penalty, lastPenalty, freezeTime } = contest
    const { id: contestProblemId, score } = contestProblem
    const contestRecordId = contestRecord.id
    const submitCount = contest.submission.length

    // 패널티 계산 공식 : (제출 횟수 - 1) * 패널티 + (대회 시작부터 Accepted까지 걸린 시간, 분)
    const submitCountPenalty = Math.floor(penalty * (submitCount - 1))
    const timePenalty = Math.floor(
      (new Date(updateTime).getTime() - new Date(startTime).getTime()) / 60000
    )
    const isFreezed = freezeTime && updateTime > freezeTime

    const contestProblemRecordData = {
      finalScore: score,
      finalTimePenalty: timePenalty,
      finalSubmitCountPenalty: submitCountPenalty,
      ...(!isFreezed ? { score, submitCountPenalty, timePenalty } : {})
    }

    let isFirstSolver = false
    try {
      await this.prisma.contestProblemFirstSolver.create({
        data: {
          contestProblemId,
          contestRecordId
        }
      })
      isFirstSolver = true
    } catch {
      // 이미 해당 문제를 푼 참가자가 존재하는 경우
      // 아무것도 하지 않음
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.contestProblemRecord.upsert({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestProblemId_contestRecordId: {
            contestProblemId,
            contestRecordId
          }
        },
        update: contestProblemRecordData,
        create: {
          contestProblemId,
          contestRecordId,
          isFirstSolver,
          ...contestProblemRecordData
        }
      })

      const contestProblemRecords = await prisma.contestProblemRecord.findMany({
        where: { contestRecordId },
        select: {
          score: true,
          timePenalty: true,
          submitCountPenalty: true,
          finalScore: true,
          finalTimePenalty: true,
          finalSubmitCountPenalty: true
        }
      })

      const initialStats = {
        scoreSum: 0,
        submitCountPenaltySum: 0,
        timePenaltySum: 0,
        maxTimePenalty: 0,
        finalScoreSum: 0,
        finalSubmitCountPenaltySum: 0,
        finalTimePenaltySum: 0,
        finalMaxTimePenalty: 0
      }

      const contestStats = { ...initialStats }

      contestProblemRecords.forEach((record) => {
        contestStats.scoreSum += record.score
        contestStats.submitCountPenaltySum += record.submitCountPenalty
        contestStats.timePenaltySum += record.timePenalty
        contestStats.maxTimePenalty = Math.max(
          contestStats.maxTimePenalty,
          record.timePenalty
        )

        contestStats.finalScoreSum += record.finalScore
        contestStats.finalSubmitCountPenaltySum +=
          record.finalSubmitCountPenalty
        contestStats.finalTimePenaltySum += record.finalTimePenalty
        contestStats.finalMaxTimePenalty = Math.max(
          contestStats.finalMaxTimePenalty,
          record.finalTimePenalty
        )
      })

      const {
        scoreSum,
        submitCountPenaltySum,
        timePenaltySum,
        maxTimePenalty,
        finalScoreSum,
        finalSubmitCountPenaltySum,
        finalTimePenaltySum,
        finalMaxTimePenalty
      } = contestStats

      const calculatePenalty = (
        lastPenalty: boolean,
        timePenalty: number,
        submitCountPenalty: number,
        maxTimePenalty: number
      ) =>
        lastPenalty
          ? maxTimePenalty + submitCountPenalty
          : timePenalty + submitCountPenalty

      const updatedData = {
        finalScore: finalScoreSum,
        finalTotalPenalty: calculatePenalty(
          lastPenalty,
          finalTimePenaltySum,
          finalSubmitCountPenaltySum,
          finalMaxTimePenalty
        ),
        ...(!isFreezed && {
          score: scoreSum,
          totalPenalty: calculatePenalty(
            lastPenalty,
            timePenaltySum,
            submitCountPenaltySum,
            maxTimePenalty
          )
        }),
        lastAcceptedTime: updateTime
      }

      await prisma.contestRecord.update({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { contestId_userId: { contestId, userId } },
        data: updatedData
      })
    })
  }

  /**
   * Assignment 제출 점수 계산 (분수 기반)
   */
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

    const submissionRecord = await this.prisma.submission.findUniqueOrThrow({
      where: { id: submission.id },
      select: {
        updateTime: true,
        score: true
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
      select: { score: true }
    })

    // assignmentProblem 이 없을 경우 (비정상 상태) 조용히 종료
    if (!assignmentProblem) return

    // Assignment 점수 계산 공식: (AssignmentProblemScore / 100) * submissionScore
    // submissionScore는 이미 0~100 범위로 계산되어 있음 (분수 기반으로)
    const realSubmissionScore =
      Math.round(
        (submissionRecord.score / PERCENTAGE_SCALE) *
          assignmentProblem.score *
          DECIMAL_PRECISION_FACTOR
      ) / DECIMAL_PRECISION_FACTOR

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

    await this.prisma.assignmentProblemRecord.update({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_userId_problemId: {
          assignmentId,
          userId,
          problemId: submission.problemId
        }
      },
      data: {
        score: realSubmissionScore,
        isSubmitted: true,
        isAccepted
      }
    })

    toBeAddedScore = realSubmissionScore - prevSubmissionScore

    if (toBeAddedScore > 0) {
      toBeAddedAcceptedProblemNum = isAccepted ? 1 : 0
    } else if (toBeAddedScore < 0) {
      toBeAddedAcceptedProblemNum = assignmentProblemRecord?.isAccepted ? -1 : 0
    }
    await this.prisma.assignmentRecord.update({
      where: { id: assignmentRecord.id },
      data: {
        acceptedProblemNum: { increment: toBeAddedAcceptedProblemNum },
        score: { increment: toBeAddedScore },
        finishTime: submission.updateTime
      }
    })
  }

  async updateSubmissionScore(id: number) {
    const submission = await this.prisma.submission.findUniqueOrThrow({
      where: { id },
      select: {
        submissionResult: {
          select: {
            problemTestcase: true,
            result: true
          }
        },
        contest: {
          select: {
            evaluateWithSampleTestcase: true
          }
        },
        problemId: true
      }
    })

    if (submission.contest && !submission.contest.evaluateWithSampleTestcase) {
      // 문제 테스트케이스 ID 목록 가져오기
      const problemTestcaseIds = new Set(
        (
          await this.prisma.problemTestcase.findMany({
            where: {
              problemId: submission.problemId,
              isHidden: false
            },
            select: { id: true }
          })
        ).map((tc) => tc.id)
      )

      // 유효한 테스트케이스만 필터링
      submission.submissionResult = submission.submissionResult.filter((sr) =>
        problemTestcaseIds.has(sr.problemTestcase.id)
      )
    }

    // 분수 기반 점수 계산
    const totalScore = this.calculateFractionalScore(
      submission.submissionResult
    )

    await this.prisma.submission.update({
      where: { id },
      data: { score: totalScore }
    })
  }

  /**
   * 분수 기반 점수 계산 헬퍼 함수
   */
  private calculateFractionalScore(
    submissionResults: Array<{
      problemTestcase: {
        id: number
        scoreWeightNumerator: number
        scoreWeightDenominator: number
      }
      result: ResultStatus
    }>
  ): number {
    // GCD와 LCM 계산 함수
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const lcm = (a: number, b: number): number => (a * b) / gcd(a, b)

    // 모든 테스트케이스의 분모의 LCM 계산
    let lcmDenominator = 1
    submissionResults.forEach((sr) => {
      const denominator = sr.problemTestcase.scoreWeightDenominator
      lcmDenominator = lcm(lcmDenominator, denominator)
    })

    // 맞은 테스트케이스의 분자 합 계산
    let acceptedNumeratorSum = 0
    let totalNumeratorSum = 0

    submissionResults.forEach((sr) => {
      const numerator = sr.problemTestcase.scoreWeightNumerator
      const denominator = sr.problemTestcase.scoreWeightDenominator
      const adjustedNumerator = numerator * (lcmDenominator / denominator)

      totalNumeratorSum += adjustedNumerator

      if (sr.result === ResultStatus.Accepted) {
        acceptedNumeratorSum += adjustedNumerator
      }
    })

    // 최종 점수 계산 (100점 만점 기준)
    if (totalNumeratorSum === 0) {
      return 0
    }

    const score = Math.round(
      (acceptedNumeratorSum / totalNumeratorSum) * PERCENTAGE_SCALE
    )
    return score
  }

  @Span()
  async updateProblemAccepted(id: number, isAccepted: boolean): Promise<void> {
    const data: {
      submissionCount: { increment: number }
      acceptedCount?: { increment: number }
    } = {
      submissionCount: { increment: 1 }
    }

    if (isAccepted) {
      data.acceptedCount = { increment: 1 }
    }

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id }
    })

    await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        acceptedRate: isAccepted
          ? (problem.acceptedCount + 1) / (problem.submissionCount + 1)
          : problem.acceptedCount / (problem.submissionCount + 1)
      }
    })
  }
}
