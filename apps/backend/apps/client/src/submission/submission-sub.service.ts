import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import {
  Prisma,
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import type { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { ValidationError, validateOrReject } from 'class-validator'
import { Span } from 'nestjs-otel'
import { JudgeAMQPService } from '@libs/amqp'
import {
  testKey,
  testcasesKey,
  userTestKey,
  userTestcasesKey
} from '@libs/cache'
import {
  PERCENTAGE_SCALE,
  Status,
  TEST_SUBMISSION_EXPIRE_TIME
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { JudgerResponse } from './class/judger-response.dto'

@Injectable()
export class SubmissionSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: JudgeAMQPService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    // MQTT 서비스에 메시지 핸들러를 등록
    this.amqpService.setMessageHandlers({
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

          const isOudated = await this.isOutdatedTestcase(res)
          if (isOudated) return

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
    this.amqpService.startSubscription()
  }

  /**
   * 채점 서버로부터 수신한 실행 결과 메시지를 처리합니다.
   * 주로 코드 실행 요청(`TestSubmission`)에 대한 결과를 처리하며, 캐시 및 DB를 업데이트합니다.
   *
   * 1. 메시지의 상태 및 에러 정보를 파싱합니다.
   * 2. `testcaseId`가 존재하지 않는 경우(컴파일 에러, 서버 에러 등), 해당 제출과 관련된 모든 테스트케이스의 결과를 에러 상태로 캐시에 업데이트하고 종료합니다.
   * 3. `testcaseId`가 존재하는 경우, 해당 테스트케이스의 결과와 출력값을 캐시에 업데이트합니다.
   * 4. 실행 결과에 포함된 CPU 시간 및 메모리 사용량을 확인하여, 해당 제출(`TestSubmission`)의 최대 리소스 사용량(maxCpuTime, maxMemoryUsage)을 DB에 갱신합니다.
   *
   * @param {JudgerResponse} msg 채점 서버로부터 수신한 응답 메시지 객체
   * @param {number} submissionId 제출 ID (`TestSubmission`의 ID)
   * @param  isUserTest '테스트 실행' 여부 (기본값: false). true인 경우 사용자 테스트용 캐시 키를 사용합니다.
   * @returns
   */
  @Span()
  async handleRunMessage(
    msg: JudgerResponse,
    submissionId: number,
    isUserTest = false
  ) {
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

      if (maxCpuTime !== newMaxCpuTime || maxMemoryUsage !== newMaxMemoryUsage)
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

  /**
   * 채점 결과 메시지와 상태 코드를 기반으로, 사용자에게 보여줄 에러 메시지를 파싱합니다.
   *
   * 1. `judgeResult.output`이 존재하는 경우, 해당 값을 최우선으로 반환합니다.
   * 2. 출력이 없는 경우 `ResultStatus`에 따라 대체 에러 메시지를 반환합니다.
   *    - CompileError: `msg.error`
   *    - SegmentationFaultError: 'Segmentation Fault'
   *    - RuntimeError: 'Value Error'
   *
   * @param {JudgerResponse} msg 채점 서버로부터 수신한 응답 메시지 객체
   * @param {ResultStatus} status 파싱된 채점 결과 상태
   * @returns {string} 파싱된 에러 메시지 문자열
   */
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

  /**
   * 채점 서버로부터 수신한 메시지의 형식을 검증합니다.
   *
   * 1. 수신한 `msg` 객체를 `JudgerResponse` DTO 인스턴스로 변환합니다 (`plainToInstance`).
   * 2. `class-validator`를 사용하여 데이터의 유효성을 검사합니다.
   * 3. 검증 성공 시 DTO 인스턴스를 반환하며, 실패 시 예외를 던집니다.
   *
   * @param {object} msg 채점 서버로부터 수신한 Raw 메시지 객체
   * @returns {Promise<JudgerResponse>} 유효성 검사가 완료된 `JudgerResponse` 객체
   * @throws {ValidationError[]} 유효성 검사 실패 시 발생
   */
  @Span()
  async validateJudgerResponse(msg: object): Promise<JudgerResponse> {
    const res: JudgerResponse = plainToInstance(JudgerResponse, msg)
    await validateOrReject(res)

    return res
  }

  /**
   * 채점 결과가 도착한 테스트케이스가 최신 상태인지(유효한지) 확인합니다.
   *
   * 문제 출제자가 테스트케이스를 수정하거나 새로 업로드하면(`uploadTestcaseZip` 등),
   * 기존 테스트케이스들은 모두 `isOutdated: true`로 설정됩니다.
   *
   * 1. 응답에 포함된 `testcaseId`가 현재 유효한지(`isOutdated: false`) 확인합니다.
   * 2. 해당 테스트케이스가 존재하지 않으면(즉, Outdated 되었거나 삭제된 경우), `true`를 반환합니다.
   *
   * @param {JudgerResponse} res 채점 서버로부터 수신한 응답 메시지 객체
   * @returns {Promise<boolean>} 테스트케이스가 만료(Outdated)되었으면 `true`, 유효하면 `false`
   */
  @Span()
  async isOutdatedTestcase(res: JudgerResponse): Promise<boolean> {
    const testcase = await this.prisma.problemTestcase.findFirst({
      where: {
        id: res.judgeResult?.testcaseId,
        isOutdated: false,
        problem: {
          submission: {
            some: { id: res.submissionId }
          }
        }
      }
    })

    return !testcase
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

  /**
   * 채점 도중 발생한 에러(컴파일 에러, 서버 에러 등)를 처리합니다.
   *
   * 1. 해당 제출이 현재 채점 중(`Judging`)인지 확인합니다. 이미 처리된 경우 종료합니다.
   * 2. `Submission` 테이블의 결과를 해당 에러 상태로 업데이트합니다.
   * 3. 관련된 모든 `SubmissionResult` (테스트케이스별 결과)를 해당 에러 상태로 일괄 업데이트합니다.
   * 4. `ServerError`인 경우, 확인을 위해 예외를 발생시킵니다.
   *
   * @param {ResultStatus} status 발생한 에러의 상태 코드 (예: CompileError, ServerError)
   * @param {JudgerResponse} msg 채점 서버로부터 수신한 상세 메시지 객체
   * @returns {Promise<void>}
   * @throws {UnprocessableDataException} ServerError 발생 시 상세 로그와 함께 예외 발생
   */
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

  /**
   * 개별 테스트케이스의 실행 통계를 업데이트합니다.
   *
   * 매 실행 시마다 `submissionCount`를 1씩 증가시키며,
   * 결과가 `Accepted`인 경우 `acceptedCount`도 1씩 증가시킵니다.
   *
   * @param {number} testcaseId 통계를 업데이트할 테스트케이스 ID
   * @param {boolean} isAccepted 채점 결과가 정답(Accepted)인지 여부
   * @returns {Promise<void>}
   */
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
          increment: isAccepted ? 1 : 0
        }
      }
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
   * 과제(Assignment) 제출에 따른 점수 및 진행 상황을 계산하여 업데이트합니다.
   *
   * 사용자가 과제 내의 문제를 제출했을 때 호출되며, 다음 두 가지 레코드를 갱신합니다:
   * 1. `AssignmentProblemRecord`: 해당 문제에 대한 개별 점수 및 정답 여부
   * 2. `AssignmentRecord`: 과제 전체에 대한 총점, 맞은 문제 수, 완료 시간
   *
   * 주요 로직:
   * 1. 점수 환산: 제출된 문제의 점수(0~100)를 과제 배점 비중(`assignmentProblem.score`)에 맞춰 환산합니다 (`realSubmissionScore`).
   * 2. 개별 기록 갱신: `AssignmentProblemRecord`를 업데이트하고, 이전 점수(`prevSubmissionScore`)를 저장합니다.
   * 3. 점수 차이 계산 (Delta): 이번 점수와 이전 점수의 차이(`toBeAddedScore`)를 계산하여 과제 총점에 반영합니다.
   * 4. 정답 수 변동 계산: 점수 변동과 별개로, 정답 상태의 변화(X -> O, O -> X)를 감지하여 맞은 문제 수(`acceptedProblemNum`)를 증감합니다.
   * 5. 전체 기록 갱신: 계산된 증감분을 `AssignmentRecord`에 적용(`increment`)합니다.
   *
   * @param {Pick<Submission, 'id' | 'problemId' | 'assignmentId' | 'userId' | 'updateTime'>} submission
   *   - 점수 계산에 필요한 제출 정보 객체
   * @param {boolean} isAccepted
   *   - 이번 제출이 정답(Accepted)인지 여부
   * @returns {Promise<void>}
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

    let toBeAddedScore = new Prisma.Decimal(0),
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
    const realSubmissionScore = (
      submissionRecord.score ?? new Prisma.Decimal(0)
    )
      .div(PERCENTAGE_SCALE)
      .mul(assignmentProblem.score)

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

    const prevSubmissionScore =
      assignmentProblemRecord?.score ?? new Prisma.Decimal(0)

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

    toBeAddedScore = realSubmissionScore.sub(prevSubmissionScore)

    const wasAcceptted = assignmentProblemRecord?.isAccepted

    if (!wasAcceptted && isAccepted) {
      // (X -> O)
      toBeAddedAcceptedProblemNum = 1
    } else if (wasAcceptted && !isAccepted) {
      // (O -> X)
      toBeAddedAcceptedProblemNum = -1
    } else {
      // (O -> O) 혹은 (X -> X)
      toBeAddedAcceptedProblemNum = 0
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

  /**
   * 제출(Submission)의 최종 점수를 계산하여 DB에 저장합니다.
   *
   * 1. 제출 정보와 연관된 채점 결과(`submissionResult`) 및 문제의 테스트케이스 배점 정보를 조회합니다.
   * 2. 대회(`Contest`) 제출인 경우, `evaluateWithSampleTestcase` 설정에 따라 점수 계산에 포함할 테스트케이스를 필터링합니다.
   *    - 예: 샘플 테스트케이스를 제외
   * 3. `calculateFractionalScore` 함수를 통해 가중치와 부분 점수를 고려한 최종 점수를 계산합니다.
   * 4. 계산된 점수를 `Submission` 테이블의 `score` 필드에 업데이트합니다.
   *
   * @param {number} id 점수를 계산할 제출의 ID
   */
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
   * 분수(Fraction) 기반으로 제출 점수를 정밀하게 계산하는 헬퍼 함수입니다.
   *
   * 각 테스트케이스의 배점이 분수 형태(분자/분모)로 저장되어 있을 때,
   * 부동소수점 연산 오차를 방지하기 위해 최소공배수(LCM)를 사용하여 통분 후 점수를 합산합니다.
   *
   * 1. 모든 테스트케이스의 분모에 대한 최소공배수(LCM)를 구합니다.
   * 2. 각 테스트케이스의 점수를 공통 분모(LCM) 기준으로 환산하여 분자(Numerator)를 합산합니다.
   * 3. (획득한 점수의 분자 합 / 전체 점수의 분자 합) * 100 공식을 사용하여 최종 점수를 계산합니다.
   *
   * @param {Array<{ problemTestcase: { id: number, scoreWeightNumerator: number, scoreWeightDenominator: number }, result: ResultStatus }>} submissionResults
   *   - 점수 계산 대상이 되는 테스트케이스 결과 목록 (테스트케이스 배점 정보 포함)
   * @returns {number} 100점 만점 기준으로 환산된 최종 점수 (정수)
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

  /**
   * 제출 처리가 완료된 후, 해당 문제의 전체 통계(제출 수, 정답 수, 정답률)를 갱신합니다.
   *
   * 1. 해당 문제의 총 제출 횟수(`submissionCount`)를 1 증가시킵니다.
   * 2. 제출 결과가 정답(`isAccepted`)인 경우, 정답 횟수(`acceptedCount`)도 1 증가시킵니다.
   * 3. 증가된 수치를 바탕으로 정답률(`acceptedRate`)을 재계산하여 업데이트합니다.
   *
   * @param {number} id 통계를 갱신할 문제의 ID
   * @param {boolean} isAccepted 제출의 최종 결과가 정답(Accepted)인지 여부
   * @returns {Promise<void>}
   */
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
