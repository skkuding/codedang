import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { Cache } from 'cache-manager'
import { contestPublicizingRequestKey } from 'src/common/cache/keys'
import {
  OPEN_SPACE_ID,
  PUBLICIZING_REQUEST_EXPIRE_TIME
} from 'src/common/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'
import { StoredPublicizingRequest } from './interface/publicizing-request.interface'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
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

  async getContestsByGroupId(
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<{
    registeredOngoing?: Partial<Contest>[]
    registeredUpcoming?: Partial<Contest>[]
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    if (userId === undefined) {
      const contests = await this.prisma.contest.findMany({
        where: {
          groupId: groupId,
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
        upcoming: this.filterUpcoming(contests),
        finished: this.filterFinished(contests)
      }
    }

    const now = new Date()
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
        groupId: groupId,
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
      upcoming: this.filterUpcoming(contests),
      finished: this.filterFinished(contests)
    }
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

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const finishedContest = contests.filter((contest) => contest.endTime <= now)
    return finishedContest
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

  async getAdminContestsByGroupId(
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId },
      select: { ...this.contestSelectOption, config: true }
    })
  }

  async getAdminContestById(contestId: number): Promise<Partial<Contest>> {
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

  async createContestRecord(contestId: number, userId: number) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { startTime: true, endTime: true }
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
