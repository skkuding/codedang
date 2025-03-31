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

  async getAssignments(groupId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true
      },
      select: {
        ...assignmentSelectOption
      },
      orderBy: [{ week: 'asc' }, { startTime: 'asc' }]
    })

    const now = new Date()

    return assignments.map(({ _count, ...assignment }) => ({
      ...assignment,
      problemCount: now < assignment.startTime ? 0 : _count.assignmentProblem
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

    const { _count, ...assignmentDetails } = assignment

    return {
      ...assignmentDetails,
      problemCount: _count.assignmentProblem
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

  async participateAllOngoingAssignments(groupId: number, userId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        startTime: {
          lte: new Date()
        }
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
      throw new EntityNotExistException('Assignment Record')
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
      throw new EntityNotExistException('Assignment')
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
      if (assignment.autoFinalizeScore) {
        result.finalScores = result.scores
      } else {
        result.finalScores = validRecords
          .map((record) => record.finalScore)
          .filter((score) => score !== null)
      }
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

    const submissions = await this.prisma.submission.findMany({
      where: { userId, assignmentId },
      select: {
        problemId: true,
        createTime: true,
        result: true
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    const submissionMap = new Map<
      number,
      { submissionTime: Date; submissionResult: string }
    >()

    for (const submission of submissions) {
      if (!submissionMap.has(submission.problemId)) {
        submissionMap.set(submission.problemId, {
          submissionTime: submission.createTime,
          submissionResult: submission.result
        })
      }
    }

    if (assignment.autoFinalizeScore) {
      assignmentRecord.finalScore = assignmentRecord.score
    }

    const problems = assignment.assignmentProblem.map((ap) => ({
      id: ap.problem.id,
      title: ap.problem.title,
      order: ap.order,
      maxScore: ap.score,
      problemRecord: problemRecordMap[ap.problemId] ?? null,
      submissionTime: submissionMap.get(ap.problemId)?.submissionTime ?? null,
      submissionResult: assignment.isJudgeResultVisible
        ? (submissionMap.get(ap.problemId)?.submissionResult ?? null)
        : null
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
      userAssignmentJudgeScore: assignment.isJudgeResultVisible
        ? assignmentRecord.score
        : null,
      assignmentPerfectScore,
      comment: assignmentRecord.comment,
      problems
    }
  }

  async getMyAssignmentsSummary(groupId: number, userId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true,
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

    const assignmentPerfectScoresMap = assignments.reduce(
      (map, { id, assignmentProblem, assignmentRecord }) => {
        if (!assignmentRecord.length) {
          throw new ForbiddenAccessException(
            'User not participated in the assignment'
          )
        }
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
          : null,
        userAssignmentJudgeScore: assignment.isJudgeResultVisible
          ? assignment.assignmentRecord[0].score
          : null
      }
    })
  }
}
