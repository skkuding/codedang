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

export interface ProblemScore {
  problemId: number
  score: number
  maxScore: number
  finalScore: number | null
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
            assignmentProblemRecord: {
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

    const now = new Date()

    return assignments.map(({ _count, assignmentRecord, ...assignment }) => ({
      ...assignment,
      problemNumber: now < assignment.startTime ? 0 : _count.assignmentProblem,
      submittedNumber: assignmentRecord[0]?.assignmentProblemRecord?.length ?? 0
    }))
  }

  async getAssignment(id: number, userId: number) {
    // check if the user has already registered this assignment
    // initial value is false

    let assignment

    const isRegistered = await this.prisma.assignmentRecord.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId: id, userId } }
    })

    if (!isRegistered) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }
    try {
      assignment = await this.prisma.assignment.findUniqueOrThrow({
        where: {
          id,
          isVisible: true
        },
        select: {
          ...assignmentSelectOption,
          description: true,
          assignmentRecord: {
            where: {
              userId
            },
            select: {
              assignmentProblemRecord: {
                where: {
                  isSubmitted: true
                },
                select: {
                  problemId: true
                }
              }
            }
          }
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

    const { _count, assignmentRecord, ...assignmentDetails } = assignment

    return {
      ...assignmentDetails,
      problemNumber: _count.assignmentProblem,
      submittedNumber: assignmentRecord[0].assignmentProblemRecord.length
    }
  }

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

    const now = new Date()
    if (now < assignment.startTime) {
      throw new ConflictFoundException('Cannot participate upcoming assignment')
    }

    const problemRecordData = assignment.assignmentProblem.map(
      ({ problemId }) => ({ assignmentId, userId, problemId })
    )

    return await this.prisma.$transaction(async (prisma) => {
      const createdAssignmentRecord = await prisma.assignmentRecord.create({
        data: { assignmentId, userId }
      })

      await prisma.assignmentProblemRecord.createMany({
        data: problemRecordData
      })

      return createdAssignmentRecord
    })
  }

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

  async getAnonymizedScores(assignmentId: number, groupId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        groupId: true,
        title: true,
        endTime: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
        autoFinalizeScore: true
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment not found')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException(
        'Not allowed to access this assignment'
      )
    }

    const now = new Date()
    if (now < assignment.endTime) {
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
      scores?: number[]
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

    if (assignment.isJudgeResultVisible) {
      result.scores = validRecords.map((record) => record.score)
    }

    if (assignment.isFinalScoreVisible) {
      result.finalScores = validRecords
        .map((record) => record.finalScore)
        .filter((score) => score !== null)
    }

    return result
  }

  async getMyAssignmentProblemRecord(assignmentId: number, userId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      select: {
        id: true,
        title: true,
        endTime: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
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
      }
    })

    if (!assignment) {
      throw new NotFoundException('Assignment')
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
          score: assignment.isJudgeResultVisible ? record.score : null,
          isSubmitted: record.isSubmitted,
          comment: record.comment
        }
        return map
      },
      {} as Record<
        number,
        {
          finalScore: number | null
          score: number | null
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
      problemRecord: problemRecordMap[ap.problemId] || null
    }))

    const assignmentPerfectScore = assignment.assignmentProblem.reduce(
      (total, { score }) => total + score,
      0
    )

    return {
      id: assignment.id,
      title: assignment.title,
      endTime: assignment.endTime,
      autoFinalizeScore: assignment.autoFinalizeScore,
      isFinalScoreVisible: assignment.isFinalScoreVisible,
      isJudgeResultVisible: assignment.isJudgeResultVisible,
      week: assignment.week,
      userAssignmentFinalScore: assignment.isFinalScoreVisible
        ? assignmentRecord.finalScore
        : null,
      userAssignmentJudgeScore: assignment.isJudgeResultVisible
        ? assignmentRecord.score
        : null,
      assignmentPerfectScore,
      comment: assignmentRecord.comment,
      problems
    }
  }
}
