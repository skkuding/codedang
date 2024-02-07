import { Injectable } from '@nestjs/common'
import { type Contest, Prisma } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException
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

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

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
        select: contestSelectOption,
        orderBy: {
          endTime: 'asc'
        }
      })

      const contestsWithParticipants = this.renameToParticipants(contests)

      return {
        ongoing: this.filterOngoing(contestsWithParticipants),
        upcoming: this.filterUpcoming(contestsWithParticipants)
      }
    }

    const registeredContestRecords = await this.prisma.contestRecord.findMany({
      where: {
        userId
      },
      select: {
        contestId: true
      }
    })

    const registeredContestIds = registeredContestRecords.map(
      (obj) => obj.contestId
    )

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
        endTime: {
          gt: now
        },
        config: {
          path: ['isVisible'],
          equals: true
        },
        id: {
          notIn: registeredContestIds
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
      select: contestSelectOption,
      orderBy: {
        endTime: 'desc'
      }
    })
    return { finished: this.renameToParticipants(finished) }
  }

  // TODO: participants 대신 _count.contestRecord 그대로 사용하는 것 고려해보기
  /** 가독성을 위해 _count.contestRecord를 participants로 변경한다. */
  renameToParticipants(contests: ContestSelectResult[]) {
    return contests.map(({ _count: countObject, ...rest }) => ({
      ...rest,
      participants: countObject.contestRecord
    }))
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

  async getContest(id: number, groupId = OPEN_SPACE_ID, userId: number) {
    // check if user can register this contest
    let canRegister = false
    let contest
    // if user is not logged in, canRegister is always true
    if (userId) {
      const hasRegistered = await this.prisma.contestRecord.findFirst({
        where: { userId, contestId: id }
      })
      if (!hasRegistered) {
        canRegister = true
      }
    }
    try {
      contest = await this.prisma.contest.findUniqueOrThrow({
        where: {
          id,
          groupId,
          config: {
            path: ['isVisible'],
            equals: true
          }
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
    // combine contest and sortedContestRecordsWithUserDetail
    return {
      ...contest,
      standings: UsersWithStandingDetail,
      canRegister
    }
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
