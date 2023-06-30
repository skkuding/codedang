import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { Contest } from '@prisma/client'
import { Cache } from 'cache-manager'
import { contestPublicizingRequestKey } from '@libs/cache'
import { OPEN_SPACE_ID, PUBLICIZING_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { StoredPublicizingRequest } from './class/publicizing-request.class'
import type { CreateContestDto } from './dto/create-contest.dto'
import type { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import type { UpdateContestDto } from './dto/update-contest.dto'

// 어드민
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

  async deleteContest(id: number) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: id
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    await this.prisma.contest.delete({
      where: {
        id: id
      }
    })

    return contest
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

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }
}
