import { Injectable } from '@nestjs/common'
import type { Contest } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { ConflictFoundException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  private contestSelectOption = {
    id: true,
    title: true,
    startTime: true,
    endTime: true,
    group: { select: { id: true, groupName: true } },
    contestRecord: { select: { id: true } }
  }

  async getContestsByGroupId<T extends number>(
    userId?: T,
    groupId?: number
  ): Promise<
    T extends undefined
      ? {
          ongoing: Partial<Contest>[]
          upcoming: Partial<Contest>[]
        }
      : {
          registeredOngoing: Partial<Contest>[]
          registeredUpcoming: Partial<Contest>[]
          ongoing: Partial<Contest>[]
          upcoming: Partial<Contest>[]
        }
  >

  async getContestsByGroupId(
    userId: number | null = null,
    groupId = OPEN_SPACE_ID
  ) {
    const now = new Date()
    if (userId == null) {
      const contests = await this.prisma.contest.findMany({
        where: {
          groupId,
          endTime: {
            gt: now
          },
          config: {
            path: ['isVisible'],
            equals: true
          }
        },
        select: this.contestSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })

      const contestsWithParticipants = contests.map(
        ({ contestRecord, ...rest }) => ({
          ...rest,
          participants: contestRecord.length
        })
      )

      return {
        ongoing: this.filterOngoing(contestsWithParticipants),
        upcoming: this.filterUpcoming(contestsWithParticipants)
      }
    }

    const userWithRegisteredContests = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        contest: {
          where: {
            endTime: {
              gt: now
            }
          },
          select: this.contestSelectOption,
          orderBy: {
            endTime: 'asc'
          }
        }
      }
    })

    const registeredContests = userWithRegisteredContests?.contest ?? []

    const registeredContestId = registeredContests.map((contest) => contest.id)
    const contests = await this.prisma.contest.findMany({
      where: {
        groupId,
        endTime: {
          gt: now
        },
        config: {
          path: ['isVisible'],
          equals: true
        },
        id: {
          notIn: registeredContestId
        }
      },
      select: this.contestSelectOption,
      orderBy: {
        endTime: 'asc'
      }
    })

    const contestsWithParticipants = contests.map(
      ({ contestRecord, ...rest }) => ({
        ...rest,
        participants: contestRecord.length
      })
    )

    return {
      registeredOngoing: this.filterOngoing(registeredContests),
      registeredUpcoming: this.filterUpcoming(registeredContests),
      ongoing: this.filterOngoing(contestsWithParticipants),
      upcoming: this.filterUpcoming(contestsWithParticipants)
    }
  }

  async getFinishedContestsByGroupId(
    cursor: number | null,
    take: number,
    groupId = OPEN_SPACE_ID
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
        config: {
          path: ['isVisible'],
          equals: true
        }
      },
      select: this.contestSelectOption,
      orderBy: {
        endTime: 'desc'
      }
    })
    return { finished }
  }

  startTimeCompare(
    a: Partial<Contest> & Pick<Contest, 'startTime'>,
    b: Partial<Contest> & Pick<Contest, 'startTime'>
  ) {
    if (a.startTime < b.startTime) {
      return -1
    }
    if (a.startTime > b.startTime) {
      return 1
    }
    return 0
  }

  filterOngoing(
    contests: Array<Partial<Contest> & Pick<Contest, 'startTime' | 'endTime'>>
  ) {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.startTime <= now && contest.endTime > now
    )
    return ongoingContest
  }

  filterUpcoming(
    contests: Array<Partial<Contest> & Pick<Contest, 'startTime'>>
  ) {
    const now = new Date()
    const upcomingContest = contests.filter(
      (contest) => contest.startTime > now
    )
    upcomingContest.sort(this.startTimeCompare)
    return upcomingContest
  }

  async getContest(
    id: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id,
        groupId,
        config: {
          path: ['isVisible'],
          equals: true
        }
      },
      select: {
        ...this.contestSelectOption,
        description: true
      }
    })

    return contest
  }

  async createContestRecord(
    contestId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: { id: contestId, groupId },
      select: { startTime: true, endTime: true, groupId: true }
    })

    const hasRegistered = await this.prisma.contestRecord.findFirst({
      where: { userId, contestId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this contest')
    }
    const now = new Date()
    if (now < contest.startTime || now >= contest.endTime) {
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
        config: {
          path: ['isVisible'],
          equals: true
        },
        groupId
      }
    }))
  }
}
