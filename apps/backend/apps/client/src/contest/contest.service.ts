import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'

const contestSelectOption = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  group: { select: { id: true, groupName: true } },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    select: {
      contestRecord: true
    }
  }
} satisfies Prisma.ContestSelect

export type ContestSelectResult = Prisma.ContestGetPayload<{
  select: typeof contestSelectOption
}>

export type ContestResult = Omit<ContestSelectResult, '_count'> & {
  participants: number
}

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestsByGroupId<T extends number | undefined | null>(
    groupId: number,
    userId?: T
  ): Promise<
    T extends undefined | null
      ? {
          ongoing: ContestResult[]
          upcoming: ContestResult[]
        }
      : {
          registeredOngoing: ContestResult[]
          registeredUpcoming: ContestResult[]
          ongoing: ContestResult[]
          upcoming: ContestResult[]
        }
  >
  async getContestsByGroupId(groupId: number, userId: number | null = null) {
    const now = new Date()
    if (userId == null) {
      const contests = await this.prisma.contest.findMany({
        where: {
          groupId,
          endTime: {
            gt: now
          },
          isVisible: true
        },
        select: contestSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })

      const contestsWithParticipants: ContestResult[] =
        this.renameToParticipants(contests)

      return {
        ongoing: this.filterOngoing(contestsWithParticipants),
        upcoming: this.filterUpcoming(contestsWithParticipants)
      }
    }

    const registeredContestIds = await this.getRegisteredContestIds(userId)

    let registeredContests: ContestSelectResult[] = []
    let restContests: ContestSelectResult[] = []

    if (registeredContestIds) {
      registeredContests = await this.prisma.contest.findMany({
        where: {
          groupId, // TODO: 기획 상 필요한 부분인지 확인하고 삭제
          id: {
            in: registeredContestIds
          },
          endTime: {
            gt: now
          }
        },
        select: contestSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })
    }

    restContests = await this.prisma.contest.findMany({
      where: {
        groupId,
        isVisible: true,
        id: {
          notIn: registeredContestIds
        },
        endTime: {
          gt: now
        }
      },
      select: contestSelectOption,
      orderBy: {
        endTime: 'asc'
      }
    })

    const registeredContestsWithParticipants =
      this.renameToParticipants(registeredContests)
    const restContestsWithParticipants = this.renameToParticipants(restContests)

    return {
      registeredOngoing: this.filterOngoing(registeredContestsWithParticipants),
      registeredUpcoming: this.filterUpcoming(
        registeredContestsWithParticipants
      ),
      ongoing: this.filterOngoing(restContestsWithParticipants),
      upcoming: this.filterUpcoming(restContestsWithParticipants)
    }
  }

  async getRegisteredOngoingUpcomingContests(
    groupId: number,
    userId: number,
    search?: string
  ) {
    const now = new Date()
    const registeredContestIds = await this.getRegisteredContestIds(userId)

    const ongoingAndUpcomings = await this.prisma.contest.findMany({
      where: {
        groupId,
        id: {
          in: registeredContestIds
        },
        endTime: {
          gt: now
        },
        title: {
          contains: search
        }
      },
      select: contestSelectOption
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

  async getRegisteredContestIds(userId: number) {
    const registeredContestRecords = await this.prisma.contestRecord.findMany({
      where: {
        userId
      },
      select: {
        contestId: true
      }
    })

    return registeredContestRecords.map((obj) => obj.contestId)
  }

  async getRegisteredFinishedContests(
    cursor: number | null,
    take: number,
    groupId: number,
    userId: number,
    search?: string
  ) {
    const now = new Date()
    const paginator = this.prisma.getPaginator(cursor)

    const registeredContestIds = await this.getRegisteredContestIds(userId)
    const contests = await this.prisma.contest.findMany({
      ...paginator,
      take,
      where: {
        groupId,
        endTime: {
          lte: now
        },
        id: {
          in: registeredContestIds
        },
        title: {
          contains: search
        },
        isVisible: true
      },
      select: contestSelectOption,
      orderBy: [{ endTime: 'desc' }, { id: 'desc' }]
    })

    const total = await this.prisma.contest.count({
      where: {
        groupId,
        endTime: {
          lte: now
        },
        id: {
          in: registeredContestIds
        },
        title: {
          contains: search
        },
        isVisible: true
      }
    })

    return { data: this.renameToParticipants(contests), total }
  }

  async getFinishedContestsByGroupId(
    cursor: number | null,
    take: number,
    groupId: number,
    search?: string
  ) {
    const paginator = this.prisma.getPaginator(cursor)
    const now = new Date()

    const finished = await this.prisma.contest.findMany({
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
      select: contestSelectOption,
      orderBy: [{ endTime: 'desc' }, { id: 'desc' }]
    })

    const total = await this.prisma.contest.count({
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

    return { data: this.renameToParticipants(finished), total }
  }

  // TODO: participants 대신 _count.contestRecord 그대로 사용하는 것 고려해보기
  /** 가독성을 위해 _count.contestRecord를 participants로 변경한다. */
  renameToParticipants(contests: ContestSelectResult[]) {
    return contests.map(({ _count: countObject, ...rest }) => ({
      ...rest,
      participants: countObject.contestRecord
    }))
  }

  filterOngoing(contests: ContestResult[]) {
    const now = new Date()
    const ongoingContest = contests
      .filter((contest) => contest.startTime <= now && contest.endTime > now)
      .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
    return ongoingContest
  }

  filterUpcoming(contests: ContestResult[]) {
    const now = new Date()
    const upcomingContest = contests
      .filter((contest) => contest.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    return upcomingContest
  }

  async getContest(id: number, groupId = OPEN_SPACE_ID, userId?: number) {
    // check if the user has already registered this contest
    // initial value is false
    let isRegistered = false
    let contest
    if (userId) {
      const hasRegistered = await this.prisma.contestRecord.findFirst({
        where: { userId, contestId: id }
      })
      if (hasRegistered) {
        isRegistered = true
      }
    }
    try {
      contest = await this.prisma.contest.findUniqueOrThrow({
        where: {
          id,
          groupId,
          isVisible: true
        },
        select: {
          ...contestSelectOption,
          description: true
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Contest')
      }
      throw error
    }
    /* HACK: standings 업데이트 로직 수정 후 삭제
    // get contest participants ranking using ContestRecord
    const sortedContestRecordsWithUserDetail =
      await this.prisma.contestRecord.findMany({
        where: {
          contestId: id
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

    const UsersWithStandingDetail = sortedContestRecordsWithUserDetail.map(
      (contestRecord, index) => ({
        ...contestRecord,
        standing: index + 1
      })
    )
    */
    // combine contest and sortedContestRecordsWithUserDetail
    return {
      ...contest,
      isRegistered
    }
  }

  async createContestRecord(
    contestId: number,
    userId: number,
    invitationCode?: string,
    groupId = OPEN_SPACE_ID
  ) {
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: { id: contestId, groupId },
      select: {
        startTime: true,
        endTime: true,
        groupId: true,
        invitationCode: true
      }
    })

    if (contest.invitationCode && contest.invitationCode !== invitationCode) {
      throw new ConflictFoundException('Invalid invitation code')
    }

    const hasRegistered = await this.prisma.contestRecord.findFirst({
      where: { userId, contestId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this contest')
    }
    const now = new Date()
    if (now >= contest.endTime) {
      throw new ConflictFoundException('Cannot participate ended contest')
    }

    return await this.prisma.contestRecord.create({
      data: { contestId, userId }
    })
  }

  async isVisible(contestId: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.contest.count({
      where: {
        id: contestId,
        isVisible: true,
        groupId
      }
    }))
  }

  async deleteContestRecord(
    contestId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    let contest
    try {
      contest = await this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId, groupId }
      })
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new EntityNotExistException('Contest')
      }
    }
    try {
      await this.prisma.contestRecord.findFirstOrThrow({
        where: { userId, contestId }
      })
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new EntityNotExistException('ContestRecord')
      }
    }
    const now = new Date()
    if (now >= contest.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended contest'
      )
    }

    try {
      return await this.prisma.contestRecord.delete({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { contestId_userId: { contestId, userId } }
      })
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new EntityNotExistException('ContestRecord')
      }
    }
  }
}
