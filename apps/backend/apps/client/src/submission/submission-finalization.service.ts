import { Injectable } from '@nestjs/common'
import {
  ContestRole,
  Prisma,
  ResultStatus,
  type Submission
} from '@prisma/client'
import { Span } from 'nestjs-otel'
import { PERCENTAGE_SCALE } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class SubmissionFinalizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 제출의 최종 결과와 점수를 DB에 저장하고, 문제 통계 및 대회/과제 기록에 반영합니다.
   *
   * Iris 채점 결과를 집계해 마무리하는 흐름에서 사용합니다. 제출 생성 시점에 이미
   * 결과/점수가 정해지는 흐름(채점할 테스트케이스가 없는 경우)은 저장이 필요 없으므로
   * `applyFinalizationEffects`를 직접 호출합니다.
   *
   * @param {Pick<Submission, 'id' | 'problemId' | 'userId' | 'contestId' | 'assignmentId' | 'createTime' | 'updateTime'>} submission
   *   - 결과를 확정할 제출 정보 객체
   * @param {ResultStatus} result - 확정할 최종 결과 상태
   * @param {number} score - 확정할 최종 점수
   * @returns {Promise<void>}
   */
  @Span()
  async finalizeSubmission(
    submission: Pick<
      Submission,
      | 'id'
      | 'problemId'
      | 'userId'
      | 'contestId'
      | 'assignmentId'
      | 'createTime'
      | 'updateTime'
    >,
    result: ResultStatus,
    score: number
  ): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submission.id },
      data: { result, score }
    })

    await this.applyFinalizationEffects(
      submission,
      result === ResultStatus.Accepted
    )
  }

  /**
   * 이미 최종 결과/점수가 반영된 제출에 대해, 문제 통계 및 대회/과제 기록에 반영합니다.
   *
   * `finalizeSubmission`이 결과/점수를 저장한 뒤 호출하는 것 외에도,
   * 제출 생성 시점에 이미 결과/점수가 확정된 경우(채점 대상 테스트케이스가 없는 경우)
   * 저장을 다시 하지 않고 이 메서드만 직접 호출할 수 있습니다.
   *
   * @param {Pick<Submission, 'id' | 'problemId' | 'userId' | 'contestId' | 'assignmentId' | 'createTime' | 'updateTime'>} submission
   *   - 후속 반영 대상 제출 정보 객체
   * @param {boolean} isAccepted - 제출 결과가 `Accepted`인지 여부
   * @returns {Promise<void>}
   */
  @Span()
  async applyFinalizationEffects(
    submission: Pick<
      Submission,
      | 'id'
      | 'problemId'
      | 'userId'
      | 'contestId'
      | 'assignmentId'
      | 'createTime'
      | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    await this.updateProblemAccepted(submission.problemId, isAccepted)

    if (submission.userId) {
      if (submission.contestId) {
        await this.updateContestRecord(submission, isAccepted)
      } else if (submission.assignmentId) {
        await this.calculateAssignmentSubmissionScore(submission, isAccepted)
      }
    }
  }

  /**
   * 업데이트된 제출 결과를 반영하여 대회 참가자의 점수 및 패널티를 갱신하는 함수
   *
   * @param {Pick<Submission, 'id' | 'problemId' | 'contestId' | 'userId' | 'createTime' | 'updateTime'>} submission
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
      'id' | 'problemId' | 'contestId' | 'userId' | 'createTime' | 'updateTime'
    >,
    isAccepted: boolean
  ): Promise<void> {
    const {
      id: submissionId,
      contestId,
      problemId,
      userId,
      updateTime
    } = submission

    if (!contestId || !userId)
      throw new UnprocessableDataException(
        `Contest record update failed - missing required fields: contestId=${contestId}, userId=${userId}`
      )

    if (!isAccepted) return

    // Contest staff(Admin/Manager/Reviewer)의 제출은 ranking 대상이 아니므로 record 갱신을 스킵합니다.
    const isStaff = await this.prisma.userContest.findFirst({
      where: {
        contestId,
        userId,
        role: {
          in: [ContestRole.Admin, ContestRole.Manager, ContestRole.Reviewer]
        }
      },
      select: { id: true }
    })
    if (isStaff) return

    const [contest, contestProblem, contestRecord, previousSubmissions] =
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
        this.prisma.submission.count({
          where: {
            contestId,
            problemId,
            userId,
            result: ResultStatus.Accepted,
            id: { not: submissionId }
          }
        })
      ])

    const isNewAccept = previousSubmissions === 0
    if (!isNewAccept) return

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
      finishTime: updateTime,
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

      const stats = await prisma.contestProblemRecord.aggregate({
        where: { contestRecordId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _sum: {
          score: true,
          submitCountPenalty: true,
          timePenalty: true,
          finalScore: true,
          finalTimePenalty: true,
          finalSubmitCountPenalty: true
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: {
          timePenalty: true,
          finalTimePenalty: true
        }
      })

      const scoreSum = stats._sum.score ?? 0
      const submitCountPenaltySum = stats._sum.submitCountPenalty ?? 0
      const timePenaltySum = stats._sum.timePenalty ?? 0
      const maxTimePenalty = stats._max.timePenalty ?? 0

      const finalScoreSum = stats._sum.finalScore ?? 0
      const finalSubmitCountPenaltySum = stats._sum.finalSubmitCountPenalty ?? 0
      const finalTimePenaltySum = stats._sum.finalTimePenalty ?? 0
      const finalMaxTimePenalty = stats._max.finalTimePenalty ?? 0

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
      submissionCount: { increment: 1 },
      ...(isAccepted && { acceptedCount: { increment: 1 } })
    }

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id },
      select: {
        submissionCount: true,
        acceptedCount: true
      }
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
