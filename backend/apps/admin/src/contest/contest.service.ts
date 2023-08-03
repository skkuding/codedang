import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { contestPublicizingRequestKey } from '@libs/cache'
import { OPEN_SPACE_ID, PUBLICIZING_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Contest } from '@admin/@generated/contest/contest.model'
import type { CreateContestInput } from './model/create-contest.input'
import type { PublicizingRequest } from './model/publicizing-request.model'
import type { UpdateContestInput } from './model/update-contest.input'

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

  async getPublicRequests() {
    const keys = await this.cacheManager.store.keys()
    const filteredKeys = keys.filter((key) => key.includes(':publicize'))
    const requests = filteredKeys.map(async (key) => {
      const r = await this.cacheManager.get<PublicizingRequest>(key)
      r.createTime = new Date(r.createTime)
      return r
    })
    return Promise.all(requests)
  }

  async createContest(
    groupId: number,
    userId: number,
    contest: CreateContestInput
  ): Promise<Contest> {
    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const newContest: Contest = await this.prisma.contest.create({
      data: {
        createdById: userId,
        groupId: groupId,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        config: contest.config
      }
    })

    return newContest
  }

  async updateContest(
    groupId: number,
    contest: UpdateContestInput
  ): Promise<Contest> {
    await this.prisma.contest.findFirst({
      where: {
        id: contest.id,
        groupId: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    if (contest.startTime >= contest.endTime) {
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

  async acceptPublicizingRequest(groupId: number, contestId: number) {
    const updatedContest = await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        groupId: OPEN_SPACE_ID
      }
    })

    if (!updatedContest) {
      throw new EntityNotExistException('contest')
    }

    const key = contestPublicizingRequestKey(contestId)

    if (!(await this.cacheManager.get(key))) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }
    await this.cacheManager.del(key)

    return updatedContest
  }

  async rejectPublicizingRequest(groupId: number, contestId: number) {
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

  async requestToPublic(groupId: number, contestId: number) {
    if (groupId == 1) {
      throw new UnprocessableEntityException(
        'This contest is already publicized'
      )
    }

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
