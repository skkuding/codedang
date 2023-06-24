import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { Prisma, Contest } from '@prisma/client'
import { Cache } from 'cache-manager'
import { PrismaService } from '@libs/prisma'
import { contestPublicizingRequestKey } from '@client/common/cache/keys'
import {
  OPEN_SPACE_ID,
  PUBLICIZING_REQUEST_EXPIRE_TIME
} from '@client/common/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@client/common/exception/business.exception'
import type { CreateContestDto } from './dto/create-contest.dto'
import type { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import type { UpdateContestDto } from './dto/update-contest.dto'
import type { StoredPublicizingRequest } from './interface/publicizing-request.interface'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private contestSelectOption = {
    id: true,
    title: true,
    startTime: true,
    endTime: true,
    group: { select: { id: true, groupName: true } }
  }

  async createContest(
    contestDto: CreateContestDto,
    userId: number
  ): Promise<Contest> {
    if (!this.isValidPeriod(contestDto.startTime, contestDto.endTime)) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const contest: Contest = await this.prisma.contest.create({
      data: {
        title: contestDto.title,
        description: contestDto.description,
        startTime: contestDto.startTime,
        endTime: contestDto.endTime,
        config: {
          isVisible: contestDto.isVisible,
          isRankVisible: contestDto.isRankVisible
        },
        group: {
          connect: { id: contestDto.groupId }
        },
        createdBy: {
          connect: { id: userId }
        }
      }
    })

    return contest
  }

  async updateContest(
    contestId: number,
    contestDto: UpdateContestDto
  ): Promise<Contest> {
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    if (!this.isValidPeriod(contestDto.startTime, contestDto.endTime)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    return await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        title: contestDto.title,
        description: contestDto.description,
        startTime: contestDto.startTime,
        endTime: contestDto.endTime,
        config: {
          isVisible: contestDto.isVisible,
          isRankVisible: contestDto.isRankVisible
        }
      }
    })
  }

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async deleteContest(contestId: number) {
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })
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
    const now = new Date()
    let findOptions: Prisma.ContestFindManyArgs = {
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
      take,
      select: this.contestSelectOption,
      orderBy: {
        endTime: 'desc'
      }
    }
    if (cursor) {
      findOptions = {
        ...findOptions,
        skip: 1,
        cursor: {
          id: cursor
        }
      }
    }

    const finished = await this.prisma.contest.findMany(findOptions)
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
    contestId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId,
        config: {
          path: ['isVisible'],
          equals: true
        }
      },
      select: {
        ...this.contestSelectOption,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    return contest
  }

  async getAdminContests(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Contest>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.contest.findMany({
      where: { groupId },
      select: { ...this.contestSelectOption, config: true },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
  }

  async getAdminOngoingContests(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Contest>[]> {
    const now = new Date()
    return await this.prisma.contest.findMany({
      where: {
        AND: [
          { groupId: groupId },
          { startTime: { lte: now } },
          { endTime: { gte: now } }
        ],
        NOT: [{ id: cursor }]
      },
      select: this.contestSelectOption,
      take: take,
      cursor: {
        id: cursor ? cursor : 1
      }
    })
  }

  async getAdminContest(contestId: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        ...this.contestSelectOption,
        config: true,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    return contest
  }

  async createContestPublicizingRequest(contestId: number, userId: number) {
    const duplicateRequest = await this.cacheManager.get(
      contestPublicizingRequestKey(contestId)
    )
    if (duplicateRequest) {
      throw new ActionNotAllowedException(
        'duplicated request',
        'request converting contest to be public'
      )
    }

    await this.cacheManager.set(
      contestPublicizingRequestKey(contestId),
      {
        contest: contestId,
        user: userId,
        createTime: new Date()
      },
      1000 * PUBLICIZING_REQUEST_EXPIRE_TIME
    )
  }

  async getContestPublicizingRequests() {
    const keys = await this.cacheManager.store.keys()
    const filteredKeys = keys.filter((key) => key.includes(':publicize'))
    const requests = filteredKeys.map(
      async (key) => await this.cacheManager.get<StoredPublicizingRequest>(key)
    )
    return Promise.all(requests)
  }

  async respondContestPublicizingRequest(
    contestId: number,
    { accepted }: RespondContestPublicizingRequestDto
  ) {
    const requestKey = contestPublicizingRequestKey(contestId)
    if (!(await this.cacheManager.get(requestKey))) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }

    if (accepted) {
      await this.updateContestToPublic(contestId)
    }
    await this.cacheManager.del(contestPublicizingRequestKey(contestId))
  }

  async updateContestToPublic(id: number) {
    await this.prisma.contest.update({
      where: {
        id
      },
      data: {
        groupId: OPEN_SPACE_ID
      }
    })
  }

  async createContestRecord(
    contestId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId
      },
      select: { startTime: true, endTime: true, groupId: true }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    const isAlreadyRecord = await this.prisma.contestRecord.findFirst({
      where: { userId, contestId },
      select: { id: true }
    })
    if (isAlreadyRecord) {
      throw new ActionNotAllowedException('repetitive participation', 'contest')
    }
    const now = new Date()
    if (now < contest.startTime || now >= contest.endTime) {
      throw new ActionNotAllowedException('participation', 'ended contest')
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
