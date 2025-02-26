import { Injectable } from '@nestjs/common'
import { Prisma, type Assignment } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
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
  group: { select: { id: true, groupName: true } },
  enableCopyPaste: true,
  isJudgeResultVisible: true,
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

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignments(groupId: number, userId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true
      },
      select: {
        ...assignmentSelectOption,
        assignmentRecord: {
          where: {
            userId
          },
          select: {
            AssignmentProblemRecord: {
              where: {
                isSubmitted: true
              },
              select: {
                problemId: true
              }
            }
          }
        }
      },
      orderBy: [{ week: 'asc' }, { startTime: 'asc' }]
    })

    return assignments.map(({ _count, assignmentRecord, ...assignment }) => ({
      ...assignment,
      problemNumber: _count.assignmentProblem,
      submittedNumber: assignmentRecord[0]?.AssignmentProblemRecord?.length ?? 0
    }))
  }

  async getAssignment(id: number, groupId = OPEN_SPACE_ID, userId?: number) {
    // check if the user has already registered this assignment
    // initial value is false
    let isRegistered = false
    let assignment: Partial<Assignment>
    if (userId) {
      const hasRegistered = await this.prisma.assignmentRecord.findFirst({
        where: { userId, assignmentId: id }
      })
      if (hasRegistered) {
        isRegistered = true
      }
    }
    try {
      assignment = await this.prisma.assignment.findUniqueOrThrow({
        where: {
          id,
          groupId,
          isVisible: true
        },
        select: {
          ...assignmentSelectOption,
          description: true
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Assignment')
      }
      throw error
    }
    /* HACK: standings 업데이트 로직 수정 후 삭제
    // get assignment participants ranking using AssignmentRecord
    const sortedAssignmentRecordsWithUserDetail =
      await this.prisma.assignmentRecord.findMany({
        where: {
          assignmentId: id
        },
        select: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          score: true,
          totalPenalty: true
        },
        orderBy: [
          {
            score: 'desc'
          },
          {
            totalPenalty: 'asc'
          }
        ]
      })

    const UsersWithStandingDetail = sortedAssignmentRecordsWithUserDetail.map(
      (assignmentRecord, index) => ({
        ...assignmentRecord,
        standing: index + 1
      })
    )
    */
    // combine assignment and sortedAssignmentRecordsWithUserDetail

    const assignmentDetails = assignment
    return {
      ...assignmentDetails,
      isRegistered
    }
  }

  async createAssignmentRecord(
    assignmentId: number,
    userId: number,
    invitationCode?: string,
    groupId = OPEN_SPACE_ID
  ) {
    const assignment = await this.prisma.assignment.findUniqueOrThrow({
      where: { id: assignmentId, groupId },
      select: {
        startTime: true,
        endTime: true,
        groupId: true
      }
    })

    const hasRegistered = await this.prisma.assignmentRecord.findFirst({
      where: { userId, assignmentId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this assignment')
    }
    const now = new Date()
    if (now >= assignment.endTime) {
      throw new ConflictFoundException('Cannot participate ended assignment')
    }

    return await this.prisma.assignmentRecord.create({
      data: { assignmentId, userId }
    })
  }

  async deleteAssignmentRecord(
    assignmentId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
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
      throw new EntityNotExistException('Assignment')
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

  async getAssignmentGradeSummary(userId: number) {
    // 1. 사용자가 등록된 모든 assignment 가져오기
    const assignmentRecords = await this.prisma.assignmentRecord.findMany({
      where: { userId },
      select: { assignmentId: true }
    })

    const assignmentIds = assignmentRecords.map((record) => record.assignmentId)

    // 2. 해당 assignment들의 상세 정보 가져오기
    const assignments = await this.prisma.assignment.findMany({
      where: {
        id: { in: assignmentIds }
      },
      select: {
        id: true,
        title: true,
        endTime: true,
        isFinalScoreVisible: true,
        autoFinalizeScore: true,
        week: true,
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
      },
      orderBy: [{ week: 'asc' }, { endTime: 'asc' }]
    })

    // 3. 해당 사용자의 모든 assignment 문제 기록 가져오기
    const allAssignmentProblemRecords =
      await this.prisma.assignmentProblemRecord.findMany({
        where: {
          userId,
          assignmentId: { in: assignmentIds }
        },
        select: {
          assignmentId: true,
          problemId: true,
          finalScore: true,
          comment: true
        }
      })

    // 4. 문제 기록을 assignment별로 그룹화
    const problemRecordsByAssignment = allAssignmentProblemRecords.reduce(
      (grouped, record) => {
        if (!grouped[record.assignmentId]) {
          grouped[record.assignmentId] = []
        }
        grouped[record.assignmentId].push(record)
        return grouped
      },
      {} as Record<number, typeof allAssignmentProblemRecords>
    )

    // 5. 각 assignment별로 결과 포맷팅
    const formattedAssignments = assignments.map((assignment) => {
      const assignmentProblemRecords =
        problemRecordsByAssignment[assignment.id] || []

      // 해당 assignment의 문제 기록 맵 생성
      const problemRecordMap = assignmentProblemRecords.reduce(
        (map, record) => {
          map[record.problemId] = {
            finalScore: record.finalScore,
            comment: record.comment
          }
          return map
        },
        {} as Record<number, { finalScore: number | null; comment: string }>
      )

      // 문제 목록 포맷팅
      const problems = assignment.assignmentProblem.map((ap) => ({
        id: ap.problem.id,
        title: ap.problem.title,
        order: ap.order,
        maxScore: ap.score,
        problemRecord: problemRecordMap[ap.problemId] || null
      }))

      // 점수 계산
      const userAssignmentFinalScore = assignmentProblemRecords.some(
        (record) => record.finalScore === null
      )
        ? null
        : assignmentProblemRecords.reduce(
            (total, { finalScore }) => total + (finalScore as number),
            0
          )

      const assignmentPerfectScore = assignment.assignmentProblem.reduce(
        (total, { score }) => total + score,
        0
      )

      return {
        id: assignment.id,
        title: assignment.title,
        endTime: assignment.endTime,
        isFinalScoreVisible: assignment.isFinalScoreVisible,
        autoFinalizeScore: assignment.autoFinalizeScore,
        week: assignment.week,
        userAssignmentFinalScore,
        assignmentPerfectScore,
        problems
      }
    })

    return {
      assignments: formattedAssignments
    }
  }
}
