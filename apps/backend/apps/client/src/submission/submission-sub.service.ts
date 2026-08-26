import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { Prisma, ResultStatus, type SubmissionResult } from '@prisma/client'
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
import { JudgerResponse, SubmissionResponse } from './class/judger-response.dto'
import { SubmissionFinalizationService } from './submission-finalization.service'

@Injectable()
export class SubmissionSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: JudgeAMQPService,
    private readonly finalization: SubmissionFinalizationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    // MQTT 서비스에 메시지 핸들러를 등록
    this.amqpService.setMessageHandlers({
      onRunMessage: async (msg: object, isUserTest: boolean) => {
        try {
          const res = await this.parseJudgerResponse(msg)

          // Run 메시지는 처리하지 않습니다.
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
      onRunSubmissionMessage: async (msg: object) => {
        try {
          const res = await this.parseSubmissionResponse(msg)

          await this.handleRunSubmissionMessage(res, res.submissionId)
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
          const res = await this.parseJudgerResponse(msg)

          // JudgerResponse 메시지는 처리하지 않습니다.
          return // Ack
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
      onSubmissionMessage: async (msg) => {
        try {
          const res = await this.parseSubmissionResponse(msg)

          const validResponse = await this.filterOutdatedTestcases(
            res.submissionId,
            res.judgeResults
          )

          res.judgeResults = validResponse

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
   * 1. 메시지를 JudgeResult 유무로 분류합니다.
   * 2. `testcaseId`가 존재하지 않는 경우(컴파일 에러, 서버 에러 등), 해당 제출과 관련된 모든 테스트케이스의 결과를 에러 상태로 캐시에 업데이트하고 종료합니다.
   * 3. `testcaseId`가 존재하는 경우, 해당 테스트케이스의 결과와 출력값을 캐시에 업데이트합니다.
   * 4. 실행 결과에 포함된 CPU 시간 및 메모리 사용량을 확인하여, 해당 제출(`TestSubmission`)의 최대 리소스 사용량(maxCpuTime, maxMemoryUsage)을 DB에 갱신합니다.
   *
   * @param {SubmissionResponse} msg 채점 서버로부터 수신한 응답 메시지 객체
   * @param {number} submissionId 제출 ID (`TestSubmission`의 ID)
   * @returns
   */
  @Span()
  async handleRunSubmissionMessage(
    msg: SubmissionResponse,
    submissionId: number
  ) {
    const isUserTest = Boolean(
      await this.cacheManager.get(userTestcasesKey(submissionId))
    )
    const key = isUserTest
      ? userTestcasesKey(submissionId)
      : testcasesKey(submissionId)

    const results = msg.judgeResults.reduce<{
      withJudgeResult: JudgerResponse[]
      withoutJudgeResult: JudgerResponse[]
      max: {
        maxCpuTime: bigint
        maxMemoryUsage: number
      }
    }>(
      (prev, v) => {
        const { judgeResult } = v

        if (judgeResult?.testcaseId || judgeResult?.testcaseId === 0) {
          prev.withJudgeResult.push(v)

          const cpuTime = BigInt(judgeResult.cpuTime)
          if (cpuTime > prev.max.maxCpuTime) {
            prev.max.maxCpuTime = cpuTime
          }

          if (judgeResult.memory > prev.max.maxMemoryUsage) {
            prev.max.maxMemoryUsage = judgeResult.memory
          }
        } else {
          prev.withoutJudgeResult.push(v)
        }

        return prev
      },
      {
        withJudgeResult: [],
        withoutJudgeResult: [],
        max: {
          maxCpuTime: 0n,
          maxMemoryUsage: 0
        }
      }
    )

    // judgeResult 없음 => testcaseId 없음
    // CompileError 또는 ServerError 발생을 의미
    // 전체 테스트케이스 결과를 해당 에러로 저장하고 함수 종료
    const isFailed = results.withoutJudgeResult.length > 0

    if (isFailed) {
      const representive = results.withoutJudgeResult[0]

      const status = Status(representive.resultCode)
      const output = this.parseError(representive, status)

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

    const testSubmission = await this.prisma.testSubmission.findUnique({
      where: { id: submissionId }
    })

    if (testSubmission) {
      const max = {
        maxCpuTime:
          (testSubmission.maxCpuTime ?? 0n) > results.max.maxCpuTime
            ? (testSubmission.maxCpuTime ?? 0n)
            : results.max.maxCpuTime,
        maxMemoryUsage:
          (testSubmission.maxMemoryUsage ?? 0) > results.max.maxMemoryUsage
            ? (testSubmission.maxMemoryUsage ?? 0)
            : results.max.maxMemoryUsage
      }

      await this.prisma.testSubmission.update({
        where: { id: testSubmission.id },
        data: max
      })
    }

    await Promise.all(
      results.withJudgeResult.map(async (response) => {
        const testcaseId = response.judgeResult!.testcaseId
        const status = Status(response.resultCode)
        const output = this.parseError(response, status)

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

        await this.cacheManager.set(key, testcase, TEST_SUBMISSION_EXPIRE_TIME)
      })
    )
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
  async parseJudgerResponse(msg: object): Promise<JudgerResponse> {
    const res: JudgerResponse = plainToInstance(JudgerResponse, msg)
    await validateOrReject(res)

    return res
  }

  /**
   * 채점 서버로부터 수신한 메시지의 형식을 검증합니다.
   *
   * 1. 수신한 `msg` 객체를 `SubmissionResponse` DTO 인스턴스로 변환합니다 (`plainToInstance`).
   * 2. `class-validator`를 사용하여 데이터의 유효성을 검사합니다.
   * 3. 검증 성공 시 DTO 인스턴스를 반환하며, 실패 시 예외를 던집니다.
   *
   * @param {object} msg 채점 서버로부터 수신한 Raw 메시지 객체
   * @returns {Promise<SubmissionResponse>} 유효성 검사가 완료된 `SubmissionResponse` 객체
   * @throws {ValidationError[]} 유효성 검사 실패 시 발생
   */
  async parseSubmissionResponse(msg: object): Promise<SubmissionResponse> {
    const res: SubmissionResponse = plainToInstance(SubmissionResponse, msg)
    await validateOrReject(res)

    return res
  }

  /**
   * 도착한 테스트케이스들이 최신 상태인지(유효한지) 확인합니다.
   *
   * 문제 출제자가 테스트케이스를 수정하거나 새로 업로드하면(`uploadTestcaseZip` 등),
   * 기존 테스트케이스들은 모두 `isOutdated: true`로 설정됩니다.
   *
   * 1. 응답에 포함된 `testcaseId`가 현재 유효한지(`isOutdated: false`) 확인합니다.
   * 2. 해당 테스트케이스가 존재하지 않으면(즉, Outdated 되었거나 삭제된 경우), 반환값에서 제외합니다.
   *
   * @param {number} submissionId 보내진 응답의 제출 ID
   * @param {JudgerResponse[]} res 채점 서버로부터 수신한 채점 결과 배열
   * @returns {Promise<JudgerResponse[]>} 유효한 채점 결과만 담은 배열
   */
  @Span()
  async filterOutdatedTestcases(
    submissionId: number,
    res: JudgerResponse[]
  ): Promise<JudgerResponse[]> {
    const testCaseIds = res
      .map((v) => v.judgeResult?.testcaseId)
      .filter((v) => v !== undefined)

    const validTestcases = await this.prisma.problemTestcase.findMany({
      select: { id: true },
      where: {
        id: { in: testCaseIds },
        isOutdated: false,
        problem: {
          submission: {
            some: { id: submissionId }
          }
        }
      }
    })

    const validIds = new Set(validTestcases.map((v) => v.id))

    return res.filter((v) => {
      const id = v.judgeResult?.testcaseId
      return id !== undefined && validIds.has(id)
    })
  }

  /**
   * 채점 서버로부터 수신한 채점 결과 메시지를 처리합니다.
   *
   * 1. 메시지의 상태 코드(`resultCode`)를 파싱하여 `ResultStatus`를 결정합니다.
   * 2. 에러 상태(ServerError, CompileError)인 경우, `handleJudgeError`를 호출하여 예외 처리를 수행하고 종료합니다.
   * 3. 정상 채점 결과인 경우, 메시지에서 실행 데이터(CPU 시간, 메모리, 출력 등)를 추출합니다.
   * 4. `updateTestcaseJudgeResult`를 호출하여 DB에 결과를 반영하고 후속 작업(통계 갱신 등)을 호출합니다.
   *
   * @param {JudgerResponse} msg 채점 서버로부터 수신한 채점 결과 메시지 객체
   * @returns {Promise<void>}
   * @throws {UnprocessableDataException} 정상 결과(`judgeResult`)가 누락된 경우 예외 발생
   */
  @Span()
  async handleJudgerMessage(msg: SubmissionResponse): Promise<void> {
    const submissionResults: {
      submissionId: number
      problemTestcaseId: number
      result: ResultStatus
      cpuTime: bigint
      memoryUsage: number
      output: string | undefined
    }[] = []

    for (const value of msg.judgeResults) {
      const status = Status(value.resultCode)

      if (
        status === ResultStatus.ServerError ||
        status === ResultStatus.CompileError
      ) {
        await this.handleJudgeError(status, value)
        return
      }

      if (!value.judgeResult) {
        throw new UnprocessableDataException(
          `JudgeResult is missing for submission ${msg.submissionId} - cannot process judge response`
        )
      }

      const submissionResult = {
        submissionId: value.submissionId,
        problemTestcaseId: value.judgeResult.testcaseId,
        result: status,
        cpuTime: BigInt(value.judgeResult.cpuTime),
        memoryUsage: value.judgeResult.memory,
        output: value.judgeResult.output
      }

      submissionResults.push(submissionResult)
    }

    await this.updateTestcaseJudgeResult(submissionResults)
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
    const { count } = await this.prisma.submission.updateMany({
      where: {
        id: msg.submissionId,
        result: ResultStatus.Judging
      },
      data: {
        result: status
      }
    })

    if (!count) return

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

  /**
   * 개별 테스트케이스의 채점 결과를 DB에 반영하고, 후속 처리를 수행합니다.
   *
   * 1. `SubmissionResult` 테이블에 해당 테스트케이스의 채점 결과(성공 여부, 시간, 메모리, 출력 등)를 업데이트합니다.
   * 2. 유효한 채점 결과(Judging, ServerError 등이 아닌 확정된 상태)라면, 테스트케이스별 통계를 갱신합니다.
   * 3. `updateSubmissionResult`를 호출하여, 해당 제출(Submission)의 전체 채점 완료 여부를 확인하고 최종 결과를 갱신합니다.
   *
   * @param {Partial<SubmissionResult> & Pick<SubmissionResult, 'result' | 'submissionId' | 'problemTestcaseId'>} submissionResult
   *   - 업데이트할 테스트케이스 결과 데이터 (필수: result, submissionId, problemTestcaseId)
   * @returns {Promise<void>}
   *    */
  @Span()
  async updateTestcaseJudgeResult(
    submissionResults: (Partial<SubmissionResult> &
      Pick<SubmissionResult, 'result' | 'submissionId' | 'problemTestcaseId'>)[]
  ): Promise<void> {
    if (submissionResults.length === 0) return

    const submissionId = submissionResults[0].submissionId

    const invalidSubmissionStatuses: Array<ResultStatus> = [
      ResultStatus.Judging,
      ResultStatus.ServerError,
      ResultStatus.Blind,
      ResultStatus.Canceled
    ]

    const statsTargets = submissionResults.filter(
      (submissionResult) =>
        !invalidSubmissionStatuses.includes(submissionResult.result)
    )

    await this.prisma.$transaction([
      this.prisma.$executeRaw`
        UPDATE "submission_result" AS sr
        SET "result" = v.result::"ResultStatus",
            "cpu_time" = v.cpu_time,
            "memory_usage" = v.memory_usage,
            "output" = v.output,
            "update_time" = NOW()
        FROM (
          VALUES ${Prisma.join(
            submissionResults.map(
              (r) => Prisma.sql`(
                ${r.problemTestcaseId}::int,
                ${r.result}::text,
                ${r.cpuTime ?? null}::bigint,
                ${r.memoryUsage ?? null}::int,
                ${r.output ?? null}::text
              )`
            )
          )}
        ) AS v(problem_test_case_id, result, cpu_time, memory_usage, output)
        WHERE sr."submission_id" = ${submissionId}
          AND sr."problem_test_case_id" = v.problem_test_case_id;
      `,
      ...(statsTargets.length > 0
        ? [
            this.prisma.$executeRaw`
            UPDATE "problem_testcase" as pt
            SET "submission_count" = pt."submission_count" + 1,
                "accepted_count" = pt."accepted_count" + v.accepted
            FROM (
              VALUES ${Prisma.join(
                statsTargets.map(
                  (r) => Prisma.sql`(
                    ${r.problemTestcaseId}::int,
                    ${r.result === ResultStatus.Accepted ? 1 : 0}::int
                  )`
                )
              )}
            ) AS v(problem_test_case_id, accepted)
            WHERE pt."id" = v.problem_test_case_id
          `
          ]
        : [])
    ])

    await this.updateSubmissionResult(submissionId)
  }

  /**
   * 개별 테스트케이스 통계를 업데이트한 후, 제출 전체의 최종 결과(Result)를 산출하고 관련 기록을 갱신합니다.
   *
   * 1. 모든 테스트케이스가 채점 완료되었는지 확인(Judging 상태가 없는지)합니다.
   * 2. 전체 결과를 집계하여 `Submission`의 최종 상태(`Accepted`, `WrongAnswer`, `ServerError` 등)를 결정합니다.
   *    - 모든 테스트케이스가 `Accepted`라면 `Accepted`.
   *    - 하나라도 실패했다면 가장 먼저 발생한 실패 원인을 따르거나 `ServerError`로 처리.
   * 3. `calculateSubmissionScore`를 호출하여 점수를 계산합니다.
   * 4. `SubmissionFinalizationService.finalizeSubmission`을 호출하여 결과/점수를 확정하고,
   *    문제 통계 및 대회/과제 기록에 반영합니다.
   *
   * @param {number} submissionId 최종 결과를 산출할 제출 ID
   * @returns {Promise<void>}
   */
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

    const result = allAccepted
      ? ResultStatus.Accepted
      : (submission.submissionResult.find(
          (submissionResult) =>
            submissionResult.result !== ResultStatus.Accepted &&
            submissionResult.result !== ResultStatus.Canceled
        )?.result ?? ResultStatus.ServerError)

    const score = await this.calculateSubmissionScore(submission.id)

    await this.finalization.finalizeSubmission(submission, result, score)
  }

  /**
   * 제출(Submission)의 최종 점수를 계산합니다.
   *
   * 1. 제출 정보와 연관된 채점 결과(`submissionResult`) 및 문제의 테스트케이스 배점 정보를 조회합니다.
   * 2. 대회(`Contest`) 제출인 경우, `evaluateWithSampleTestcase` 설정에 따라 점수 계산에 포함할 테스트케이스를 필터링합니다.
   *    - 예: 샘플 테스트케이스를 제외
   * 3. `calculateFractionalScore` 함수를 통해 가중치와 부분 점수를 고려한 최종 점수를 계산합니다.
   *
   * DB 저장은 이 메서드를 호출하는 쪽(`SubmissionFinalizationService.finalizeSubmission`)에서 처리합니다.
   *
   * @param {number} id 점수를 계산할 제출의 ID
   * @returns {Promise<number>} 계산된 최종 점수
   */
  async calculateSubmissionScore(id: number): Promise<number> {
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
    return this.calculateFractionalScore(submission.submissionResult)
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
}
