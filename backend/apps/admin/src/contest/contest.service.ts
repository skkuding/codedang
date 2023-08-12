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
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { Contest } from '@admin/@generated/contest/contest.model'
import type { CreateContestInput } from './model/contest.input'
import type { UpdateContestInput } from './model/contest.input'
import type { PublicizingRequest } from './model/publicizing-request.model'

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
        config: {
          isVisible: contest.config.isVisible,
          isRankVisible: contest.config.isRankVisible
        }
      }
    })

    return newContest
  }

  async updateContest(
    groupId: number,
    contest: UpdateContestInput
  ): Promise<Contest> {
    const contestFound = await this.prisma.contest.findFirst({
      where: {
        id: contest.id,
        groupId: groupId
      }
    })
    if (!contestFound) {
      throw new EntityNotExistException('contest')
    }

    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
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
        config: {
          isVisible: contest.config.isVisible,
          isRankVisible: contest.config.isRankVisible
        }
      }
    })
  }

  async deleteContest(groupId: number, contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })

    return contest
  }

  async getPublicizingRequests() {
    const keys = await this.cacheManager.store.keys()
    const filteredKeys = keys.filter((key) => key.includes(':publicize'))
    const requests = filteredKeys.map(async (key) => {
      const r = await this.cacheManager.get<PublicizingRequest>(key)
      r.expireTime = new Date(r.expireTime)
      return r
    })
    return await Promise.all(requests)
  }

  async acceptPublicizingRequest(contestId: number) {
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

  async rejectPublicizingRequest(contestId: number) {
    const key = contestPublicizingRequestKey(contestId)

    if (!(await this.cacheManager.get(key))) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }
    await this.cacheManager.del(key)

    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    return contest
  }

  async createPublicizingRequest(groupId: number, contestId: number) {
    if (groupId == OPEN_SPACE_ID) {
      throw new UnprocessableEntityException(
        'This contest is already publicized'
      )
    }

    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId: groupId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    const key = contestPublicizingRequestKey(contestId)

    const duplicatedRequest = await this.cacheManager.get(key)
    if (duplicatedRequest) {
      throw new ConflictFoundException('duplicated publicizing request')
    }

    await this.cacheManager.set(
      key,
      {
        contestId: contestId,
        userId: contest.createdById,
        expireTime: new Date(Date.now() + PUBLICIZING_REQUEST_EXPIRE_TIME)
      },
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    const pr = await this.cacheManager.get<PublicizingRequest>(key)
    pr.expireTime = new Date(pr.expireTime)
    return pr
  }

  async importProblems(
    groupId: number,
    contestId: number,
    problemIds: number[]
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    if (contest.groupId != groupId) {
      throw new ConflictFoundException('contest must be in the group')
    }

    const contestProblems = []
    for (const problemId of problemIds) {
      const problem = await this.prisma.problem.findUnique({
        where: {
          id: problemId
        }
      })
      if (!problem) {
        throw new EntityNotExistException('problem')
      }

      if (problem.groupId != groupId) {
        continue
      }

      contestProblems.push(
        await this.prisma.contestProblem.create({
          data: {
            id: 'temp',
            contestId: contestId,
            problemId: problemId
          }
        })
      )
    }

    return contestProblems
  }
}
