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
    group: { select: { id: true, groupName: true } }
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
    userId: number = undefined,
    groupId = OPEN_SPACE_ID
  ) {
    const now = new Date()
    if (userId === undefined) {
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
      return {
        ongoing: this.filterOngoing(contests),
        upcoming: this.filterUpcoming(contests)
      }
    }

    const registeredContests = (
      await this.prisma.user.findUnique({
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
    ).contest

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

    return {
      registeredOngoing: this.filterOngoing(registeredContests),
      registeredUpcoming: this.filterUpcoming(registeredContests),
      ongoing: this.filterOngoing(contests),
      upcoming: this.filterUpcoming(contests)
    }
  }

  async getFinishedContestsByGroupId(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<{
    finished: Partial<Contest>[]
  }> {
    let skip = take < 0 ? 0 : 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const now = new Date()

    const finished = await this.prisma.contest.findMany({
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
      skip,
      take,
      cursor: {
        id: cursor
      },
      select: this.contestSelectOption,
      orderBy: {
        endTime: 'desc'
      }
    })
    return { finished }
  }

  startTimeCompare(a: Contest, b: Contest) {
    if (a.startTime < b.startTime) {
      return -1
    }
    if (a.startTime > b.startTime) {
      return 1
    }
    return 0
  }

  filterOngoing(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.startTime <= now && contest.endTime > now
    )
    return ongoingContest
  }

  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
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
        groupId: groupId
      }
    }))
  }
}
