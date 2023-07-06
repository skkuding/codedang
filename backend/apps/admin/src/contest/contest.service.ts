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

// 어드민
@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getContests(
    take: number,
    groupId: number,
    cursor?: number
  ): Promise<Partial<Contest>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }

    return await this.prisma.contest.findMany({
      where: { groupId },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
  }

  async createContest(contest: Contest): Promise<Contest> {
    if (contest.startTime > contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const newContest: Contest = await this.prisma.contest.create({
      data: {
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        group: {
          connect: { id: contest.groupId }
        },
        createdBy: {
          connect: { id: contest.createdById }
        },
        config: contest.config
      }
    })

    return newContest
  }

  async updateContest(contest: Contest): Promise<Contest> {
    await this.prisma.contest.findUnique({
      where: {
        id: contest.id
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    if (contest.startTime > contest.endTime) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    return await this.prisma.contest.update({
      where: {
        id: contest.id
      },
      data: {
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        config: contest.config
      }
    })
  }

  async deleteContest(groupId: number, contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })

    return contest
  }

  async getPublicRequests(groupId: number, cursor: number, take: number) {
    const keys = await this.cacheManager.store.keys()
    const filteredKeys = keys.filter((key) => key.includes(':publicize'))
    const requests = filteredKeys.map(
      async (key) => await this.cacheManager.get<StoredPublicizingRequest>(key)
    )
    return Promise.all(requests)
  }

  async acceptPublic(groupId: number, contestId: number) {
    const updatedContest = await this.updateContestToPublic(contestId)

    if (!updatedContest) {
      throw new EntityNotExistException('contest')
    }
    return updatedContest
  }

  async rejectPublic(groupId: number, contestId: number) {
    const key = contestPublicizingRequestKey(contestId)

    if (!(await this.cacheManager.get(key))) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }
    await this.cacheManager.del(key)

    return await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })
  }

  async updateContestToPublic(id: number) {
    return await this.prisma.contest.update({
      where: {
        id
      },
      data: {
        groupId: OPEN_SPACE_ID
      }
    })
  }

  async requestToPublic(groupId: number, contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    const duplicatedRequest = await this.cacheManager.get(
      contestPublicizingRequestKey(contestId)
    )
    if (duplicatedRequest) {
      throw new ActionNotAllowedException(
        'duplicated request',
        'request converting contest to be public'
      )
    }

    await this.cacheManager.set(
      contestPublicizingRequestKey(contestId),
      {
        contest: contestId,
        user: contest.createdById,
        createTime: new Date()
      },
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    return contest
  }
}
