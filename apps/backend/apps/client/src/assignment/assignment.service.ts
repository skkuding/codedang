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
  invitationCode: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    select: {
      assignmentRecord: true
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

  async getAssignmentsByGroupId<T extends number | undefined | null>(
    groupId: number,
    userId?: T
  ): Promise<
    T extends undefined | null
      ? {
          ongoing: AssignmentResult[]
          upcoming: AssignmentResult[]
        }
      : {
          registeredOngoing: AssignmentResult[]
          registeredUpcoming: AssignmentResult[]
          ongoing: AssignmentResult[]
          upcoming: AssignmentResult[]
        }
  >
  async getAssignmentsByGroupId(groupId: number, userId: number | null = null) {
    const now = new Date()
    if (userId == null) {
      const assignments = await this.prisma.assignment.findMany({
        where: {
          groupId,
          endTime: {
            gt: now
          },
          isVisible: true
        },
        select: assignmentSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })

      const assignmentsWithParticipants: AssignmentResult[] =
        this.renameToParticipants(assignments)

      return {
        ongoing: this.filterOngoing(assignmentsWithParticipants),
        upcoming: this.filterUpcoming(assignmentsWithParticipants)
      }
    }

    const registeredAssignmentIds =
      await this.getRegisteredAssignmentIds(userId)

    let registeredAssignments: AssignmentSelectResult[] = []
    let restAssignments: AssignmentSelectResult[] = []

    if (registeredAssignmentIds) {
      registeredAssignments = await this.prisma.assignment.findMany({
        where: {
          groupId, // TODO: 기획 상 필요한 부분인지 확인하고 삭제
          id: {
            in: registeredAssignmentIds
          },
          endTime: {
            gt: now
          }
        },
        select: assignmentSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })
    }

    restAssignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true,
        id: {
          notIn: registeredAssignmentIds
        },
        endTime: {
          gt: now
        }
      },
      select: assignmentSelectOption,
      orderBy: {
        endTime: 'asc'
      }
    })

    const registeredAssignmentsWithParticipants = this.renameToParticipants(
      registeredAssignments
    )
    const restAssignmentsWithParticipants =
      this.renameToParticipants(restAssignments)

    return {
      registeredOngoing: this.filterOngoing(
        registeredAssignmentsWithParticipants
      ),
      registeredUpcoming: this.filterUpcoming(
        registeredAssignmentsWithParticipants
      ),
      ongoing: this.filterOngoing(restAssignmentsWithParticipants),
      upcoming: this.filterUpcoming(restAssignmentsWithParticipants)
    }
  }

  async getRegisteredOngoingUpcomingAssignments(
    groupId: number,
    userId: number,
    search?: string
  ) {
    const now = new Date()
    const registeredAssignmentIds =
      await this.getRegisteredAssignmentIds(userId)

    const ongoingAndUpcomings = await this.prisma.assignment.findMany({
      where: {
        groupId,
        id: {
          in: registeredAssignmentIds
        },
        endTime: {
          gt: now
        },
        title: {
          contains: search
        }
      },
      select: assignmentSelectOption
    })

    const ongoingAndUpcomingsWithParticipants =
      this.renameToParticipants(ongoingAndUpcomings)

    return {
      registeredOngoing: this.filterOngoing(
        ongoingAndUpcomingsWithParticipants
      ),
      registeredUpcoming: this.filterUpcoming(
        ongoingAndUpcomingsWithParticipants
      )
    }
  }

  async getRegisteredAssignmentIds(userId: number) {
    const registeredAssignmentRecords =
      await this.prisma.assignmentRecord.findMany({
        where: {
          userId
        },
        select: {
          assignmentId: true
        }
      })

    return registeredAssignmentRecords.map((obj) => obj.assignmentId)
  }

  async getRegisteredFinishedAssignments(
    cursor: number | null,
    take: number,
    groupId: number,
    userId: number,
    search?: string
  ) {
    const now = new Date()
    const paginator = this.prisma.getPaginator(cursor)

    const registeredAssignmentIds =
      await this.getRegisteredAssignmentIds(userId)
    const assignments = await this.prisma.assignment.findMany({
      ...paginator,
      take,
      where: {
        groupId,
        endTime: {
          lte: now
        },
        id: {
          in: registeredAssignmentIds
        },
        title: {
          contains: search
        },
        isVisible: true
      },
      select: assignmentSelectOption,
      orderBy: [{ endTime: 'desc' }, { id: 'desc' }]
    })

    const total = await this.prisma.assignment.count({
      where: {
        groupId,
        endTime: {
          lte: now
        },
        id: {
          in: registeredAssignmentIds
        },
        title: {
          contains: search
        },
        isVisible: true
      }
    })

    return { data: this.renameToParticipants(assignments), total }
  }

  async getFinishedAssignmentsByGroupId(
    userId: number | null,
    cursor: number | null,
    take: number,
    groupId: number,
    search?: string
  ) {
    const paginator = this.prisma.getPaginator(cursor)
    const now = new Date()

    const finished = await this.prisma.assignment.findMany({
      ...paginator,
      take,
      where: {
        endTime: {
          lte: now
        },
        groupId,
        isVisible: true,
        title: {
          contains: search
        }
      },
      select: assignmentSelectOption,
      orderBy: [{ endTime: 'desc' }, { id: 'desc' }]
    })

    const countRenamedAssignments = this.renameToParticipants(finished)

    const finishedAssignmentWithIsRegistered = await Promise.all(
      countRenamedAssignments.map(async (assignment) => {
        return {
          ...assignment,
          // userId가 없거나(로그인 안됨) assignment에 참여중이지 않은 경우 false
          isRegistered:
            !(await this.prisma.assignmentRecord.findFirst({
              where: {
                userId,
                assignmentId: assignment.id
              }
            })) || !userId
              ? false
              : true
        }
      })
    )

    const total = await this.prisma.assignment.count({
      where: {
        endTime: {
          lte: now
        },
        groupId,
        isVisible: true,
        title: {
          contains: search
        }
      }
    })

    return {
      data: finishedAssignmentWithIsRegistered,
      total
    }
  }

  // TODO: participants 대신 _count.assignmentRecord 그대로 사용하는 것 고려해보기
  /** 가독성을 위해 _count.assignmentRecord를 participants로 변경한다. */
  renameToParticipants(assignments: AssignmentSelectResult[]) {
    return assignments.map(({ _count: countObject, ...rest }) => ({
      ...rest,
      participants: countObject.assignmentRecord
    }))
  }

  filterOngoing(assignments: AssignmentResult[]) {
    const now = new Date()
    const ongoingAssignment = assignments
      .filter(
        (assignment) => assignment.startTime <= now && assignment.endTime > now
      )
      .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
    return ongoingAssignment
  }

  filterUpcoming(assignments: AssignmentResult[]) {
    const now = new Date()
    const upcomingAssignment = assignments
      .filter((assignment) => assignment.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    return upcomingAssignment
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

    const { invitationCode, ...assignmentDetails } = assignment
    const invitationCodeExists = invitationCode != null
    return {
      ...assignmentDetails,
      invitationCodeExists,
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
        groupId: true,
        invitationCode: true
      }
    })

    if (
      assignment.invitationCode &&
      assignment.invitationCode !== invitationCode
    ) {
      throw new ConflictFoundException('Invalid invitation code')
    }

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

  async isVisible(assignmentId: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.assignment.count({
      where: {
        id: assignmentId,
        isVisible: true,
        groupId
      }
    }))
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
}
