import { Injectable } from '@nestjs/common'
import { Prisma, type Assignment } from '@prisma/client'
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

  async getAssignment(id: number, groupId: number, userId?: number) {
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
    groupId: number,
    invitationCode?: string
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
}
