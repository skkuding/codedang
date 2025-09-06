import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'

const assignmentSelectOption = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  dueTime: true,
  group: { select: { id: true, groupName: true } },
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  isFinalScoreVisible: true,
  autoFinalizeScore: true,
  week: true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    select: {
      assignmentRecord: true,
      assignmentProblem: true
    }
  }
} satisfies Prisma.AssignmentSelect

export type AssignmentSelectResult = Prisma.AssignmentGetPayload<{
  select: typeof assignmentSelectOption
}>

export type AssignmentResult = Omit<AssignmentSelectResult, '_count'> & {
  participants: number
}

export interface ProblemScore {
  problemId: number
  score: number
  maxScore: number
  finalScore: number | null
}

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 그룹의 모든 assignment 혹은 exercise를 가져옵니다
   *
   * @param {number} groupId 그룹 아이디
   * @param {boolean} isExercise exercise를 가져올지 assignment를 가져올지 여부
   * @param {number} month 조회할 월 (1-12, 선택적)
   * @param {number} year 조회할 년도 (선택적)
   * @returns 특정 그룹의 모든 assignment를 문제 개수와 함께 반환합니다.
   * 아직 시작되지 않은 assignment의 경우 문제 개수는 0이 됩니다.
   * month와 year가 제공되면 해당 월에 dueTime이 속한 assignment만 반환합니다.
   */
  async getAssignments(
    groupId: number,
    isExercise?: boolean,
    month?: number,
    year?: number
  ) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        ...(isExercise !== undefined ? { isExercise } : {}),
        groupId,
        isVisible: true,
        ...(month !== undefined && year !== undefined
          ? {
              dueTime: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0, 23, 59, 59, 999)
              }
            }
          : {})
      },
      select: {
        ...assignmentSelectOption,
        isExercise: true
      },
      orderBy: [{ week: 'asc' }, { startTime: 'asc' }]
    })

    const now = new Date()

    return assignments.map(({ _count, ...assignment }) => ({
      ...assignment,
      problemCount: now < assignment.startTime ? 0 : _count.assignmentProblem
    }))
  }

  /**
   * 유저가 속한 경우에 한해 assignment를 제공합니다.
   *
   * @param {number} id assignment 아이디
   * @param {number} userId 유저 아이디
   * @returns assignment를 반환합니다.
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * - 해당 assignment에 등록되지 않은 유저가 접근 할 때
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 제공된 id를 가진 assignment를 찾을 수 없을 때
   */
  async getAssignment(id: number, userId: number) {
    const isRegistered = await this.prisma.assignmentRecord.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId: id, userId } },
      select: { id: true }
    })

    if (!isRegistered) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      select: {
        ...assignmentSelectOption,
        description: true,
        isVisible: true,
        group: {
          select: {
            userGroup: {
              where: { userId },
              take: 1,
              select: { isGroupLeader: true }
            }
          }
        }
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    const { _count, group, ...assignmentDetails } = assignment

    if (!group.userGroup[0].isGroupLeader) {
      if (
        !assignmentDetails.isVisible ||
        assignmentDetails.startTime > new Date()
      ) {
        throw new EntityNotExistException('Assignment')
      }
    }

    return {
      ...assignmentDetails,
      problemCount: _count.assignmentProblem
    }
  }

  /**
   * assignmentRecord를 만들어 유저를 특정 assignment에 포함시킵니다.
   *
   * @param {number} assignmentId assignment 아이디
   * @param {number} userId assignment에 포함시킬 유저 아이디
   * @param {number} groupId assignment가 속한 그룹 아이디
   * @returns {Promise<AssignmentRecord>} assignmentRecord를 만든 후 그 기록을 반환합니다.
   * @throws {ConflictFoundException} 아래와 같은 경우 발생합니다.
   * - 이미 유저가 해당 assignment에 속해 있을 때
   */
  async createAssignmentRecord(
    assignmentId: number,
    userId: number,
    groupId: number
  ) {
    const assignment = await this.prisma.assignment.findUniqueOrThrow({
      where: { id: assignmentId, groupId },
      select: {
        startTime: true,
        assignmentProblem: {
          select: {
            problemId: true
          }
        }
      }
    })

    const hasRegistered = await this.prisma.assignmentRecord.findFirst({
      where: { userId, assignmentId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this assignment')
    }

    const problemRecordData = assignment.assignmentProblem.map(
      ({ problemId }) => ({ assignmentId, userId, problemId })
    )

    return await this.prisma.$transaction(async (prisma) => {
      const createdAssignmentRecord = await prisma.assignmentRecord.create({
        data: { assignmentId, userId }
      })

      await prisma.assignmentProblemRecord.createMany({
        data: problemRecordData,
        skipDuplicates: true
      })

      return createdAssignmentRecord
    })
  }

  /**
   * 특정 그룹의 진행 중인 모든 assignment에 유저를 참여시킵니다.
   *
   * @param groupId 그룹 아이디
   * @param userId 포함시킬 유저 아이디
   * @returns {Promise<number[]>} 유저가 참여하게 된 모든 assignment의 id를 반환합니다.
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - 조회된 assignment가 없을 때
   */
  async participateAllOngoingAssignments(groupId: number, userId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId
      },
      select: {
        id: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            assignmentRecord: {
              where: { userId }
            }
          }
        }
      }
    })

    if (!assignments.length) {
      throw new NotFoundException('Assignment')
    }

    const notParticipatedAssignmentIds = assignments
      .filter((assignment) => !assignment._count.assignmentRecord)
      .map((assignment) => assignment.id)

    await Promise.all(
      notParticipatedAssignmentIds.map((assignmentId) =>
        this.createAssignmentRecord(assignmentId, userId, groupId)
      )
    )

    return notParticipatedAssignmentIds
  }

  /**
   * 아직 시작하지 않은 assignment에서 유저를 제외합니다
   *
   * @param assignmentId assignment 아이디
   * @param userId 제외할 유저 아이디
   * @param groupId assignment가 속한 그룹 아이디
   * @returns {Promise<AssignmentRecord>} 제거된 assignmentRecord을 반환합니다.
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - assignment가 존재하지 않을 때
   * - 유저가 assignment에 참여하지 않아 assignmentRecord가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * - 이미 assignment가 시작했거나 끝났을 때
   */
  async deleteAssignmentRecord(
    assignmentId: number,
    userId: number,
    groupId: number
  ) {
    const [assignment, assignmentRecord] = await Promise.all([
      this.prisma.assignment.findUnique({
        where: { id: assignmentId, groupId }
      }),
      this.prisma.assignmentRecord.findFirst({
        where: { userId, assignmentId }
      })
    ])

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (!assignmentRecord) {
      throw new EntityNotExistException('AssignmentRecord')
    }

    const now = new Date()
    if (now >= assignment.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended assignment'
      )
    }

    return await this.prisma.assignmentRecord.delete({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId, userId } }
    })
  }

  /**
   * Assignment 통계 모달을 위해 익명화된 모든 참여자의 점수를 가져옵니다
   * Autofinalize가 true인 경우 score를 finalScore로 사용합니다
   * isFinalScoreVisible이 false인 경우 finalScore를 null로 설정합니다
   * @param {number} groupId assignment의 groupId
   * @param {number} assignmentId 점수를 조회하려는 Assignment ID
   * @returns {Promise<{
   *   assignmentId: number;
   *   title: string;
   *   totalParticipants: number;
   *   finalScores?: number[];
   *   autoFinalizeScore: boolean;
   *   isFinalScoreVisible: boolean;
   * }>}
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - assignment가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * - assignment와 그룹 아이디가 일치하지 않을 때
   * - assignment가 아직 끝나지 않았을 때
   */
  async getAnonymizedScores(assignmentId: number, groupId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        groupId: true,
        title: true,
        dueTime: true,
        isFinalScoreVisible: true,
        autoFinalizeScore: true
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException(
        'Not allowed to access this assignment'
      )
    }

    const now = new Date()
    if (now < assignment.dueTime) {
      throw new ForbiddenAccessException(
        'Cannot view scores before assignment ends'
      )
    }

    const assignmentRecords = await this.prisma.assignmentRecord.findMany({
      where: { assignmentId },
      select: {
        userId: true,
        score: true,
        finalScore: true
      }
    })

    const validRecords = assignmentRecords.filter(
      (record) => record.userId !== null
    )

    const result: {
      assignmentId: number
      title: string
      totalParticipants: number
      finalScores?: number[]
      autoFinalizeScore: boolean
      isFinalScoreVisible: boolean
    } = {
      assignmentId: assignment.id,
      title: assignment.title,
      totalParticipants: validRecords.length,
      autoFinalizeScore: assignment.autoFinalizeScore,
      isFinalScoreVisible: assignment.isFinalScoreVisible
    }

    if (assignment.isFinalScoreVisible) {
      if (assignment.autoFinalizeScore) {
        result.finalScores = validRecords.map((record) => record.score)
      } else {
        result.finalScores = validRecords
          .map((record) => record.finalScore)
          .filter((score) => score !== null)
      }
    }

    return result
  }

  /**
   * 특정 사용자의 과제 문제 기록을 가져옵니다.
   * - 과제의 문제별 점수, 제출 여부, 코멘트 등을 포함합니다.
   * - 과제의 자동 점수 산정 여부 및 최종 점수 공개 여부에 따라 반환 값이 달라질 수 있습니다.
   *
   * @param {number} assignmentId 조회하려는 과제의 ID
   * @param {number} userId 조회하려는 사용자의 ID
   * @returns {Promise<{
   *   id: number;
   *   autoFinalizeScore: boolean;
   *   isFinalScoreVisible: boolean;
   *   isJudgeResultVisible: boolean;
   *   userAssignmentFinalScore: number | null;
   *   assignmentPerfectScore: number;
   *   comment: string | null;
   *   problems: Array<{
   *     id: number;
   *     title: string;
   *     order: number;
   *     maxScore: number;
   *     problemRecord: {
   *       finalScore: number | null;
   *       isSubmitted: boolean;
   *       comment: string | null;
   *     } | null;
   *   }>;
   * }>}
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - assignment가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * - 유저가 assignment에 포함되지 않았을 때
   */
  async getMyAssignmentProblemRecord(assignmentId: number, userId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        startTime: {
          lte: new Date()
        }
      },
      select: {
        id: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
        autoFinalizeScore: true,
        assignmentProblem: {
          select: {
            problemId: true,
            order: true,
            score: true,
            problem: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    const assignmentRecord = await this.prisma.assignmentRecord.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_userId: { assignmentId, userId }
      },
      select: {
        score: true,
        finalScore: true,
        comment: true
      }
    })

    if (!assignmentRecord) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }

    const assignmentProblemRecords =
      await this.prisma.assignmentProblemRecord.findMany({
        where: {
          assignmentId,
          userId
        },
        select: {
          problemId: true,
          isSubmitted: true,
          score: true,
          finalScore: true,
          comment: true
        }
      })

    const problemRecordMap = assignmentProblemRecords.reduce(
      (map, record) => {
        if (assignment.autoFinalizeScore) {
          record.finalScore = record.score
        }
        map[record.problemId] = {
          finalScore: assignment.isFinalScoreVisible ? record.finalScore : null,
          isSubmitted: record.isSubmitted,
          comment: record.comment
        }
        return map
      },
      {} as Record<
        number,
        {
          finalScore: number | null
          isSubmitted: boolean
          comment: string
        }
      >
    )

    if (assignment.autoFinalizeScore) {
      assignmentRecord.finalScore = assignmentRecord.score
    }

    const problems = assignment.assignmentProblem.map((ap) => ({
      id: ap.problem.id,
      title: ap.problem.title,
      order: ap.order,
      maxScore: ap.score,
      problemRecord: problemRecordMap[ap.problemId] ?? null
    }))

    const assignmentPerfectScore = assignment.assignmentProblem.reduce(
      (total, { score }) => total + score,
      0
    )

    return {
      id: assignment.id,
      autoFinalizeScore: assignment.autoFinalizeScore,
      isFinalScoreVisible: assignment.isFinalScoreVisible,
      isJudgeResultVisible: assignment.isJudgeResultVisible,
      userAssignmentFinalScore: assignment.isFinalScoreVisible
        ? assignmentRecord.finalScore
        : null,
      assignmentPerfectScore,
      comment: assignmentRecord.comment,
      problems
    }
  }

  /**
   * 한 그룹에서 특정 유저의 모든 assignment 결과를 요약해 가져옵니다.
   * 요약한 내용에는 assignment 아이디, 문제/제출 수, 문제 별 점수의 총합, 최종 점수가 포함됩니다.
   * assignment의 isFinalScoreVisible가 false일 때 userAssignmentFinalScore는 null이 됩니다.
   *
   * @param groupId 가져올 assignment가 속한 그룹 아이디
   * @param userId 유저 아이디
   * @param isExercise exercise를 가져올지 여부
   * @returns 한 그룹에서 특정 유저의 assignment 별 결과를 요약해 반환합니다.
   * @throws {ForbiddenAccessException} 아래와 같은 경우 발생합니다.
   * - 조회한 assignment에 유저가 포함되지 않았을 때
   */
  async getMyAssignmentsSummary(
    groupId: number,
    userId: number,
    isExercise: boolean
  ) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true,
        isExercise,
        startTime: {
          lte: new Date()
        }
      },
      select: {
        id: true,
        autoFinalizeScore: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
        assignmentProblem: {
          select: {
            score: true
          }
        },
        assignmentRecord: {
          where: { userId },
          select: {
            score: true,
            finalScore: true,
            assignmentProblemRecord: {
              select: {
                finalScore: true
              }
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: {
              select: {
                assignmentProblemRecord: {
                  where: {
                    isSubmitted: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [{ week: 'asc' }, { startTime: 'asc' }]
    })

    if (!assignments.length) {
      return []
    }

    // 각 assignment의  problem 별 점수 총합
    const assignmentPerfectScoresMap = assignments.reduce(
      (map, { id, assignmentProblem, assignmentRecord }) => {
        if (!assignmentRecord.length) {
          throw new ForbiddenAccessException(
            'User not participated in the assignment'
          )
        }
        assignmentRecord[0].finalScore =
          assignmentRecord[0].assignmentProblemRecord.reduce(
            (sum, { finalScore }) => sum + (finalScore ?? 0),
            0
          )
        const total = assignmentProblem.reduce(
          (sum, { score }) => sum + score,
          0
        )
        map[id] = total
        return map
      },
      {}
    )

    return assignments.map((assignment) => {
      if (assignment.autoFinalizeScore) {
        assignment.assignmentRecord[0].finalScore =
          assignment.assignmentRecord[0].score
      }

      return {
        id: assignment.id,
        problemCount: assignment.assignmentProblem.length,
        submittedCount:
          assignment.assignmentRecord[0]._count.assignmentProblemRecord,
        assignmentPerfectScore: assignmentPerfectScoresMap[assignment.id],
        userAssignmentFinalScore: assignment.isFinalScoreVisible
          ? assignment.assignmentRecord[0].finalScore
          : null
      }
    })
  }
}
