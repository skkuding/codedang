import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import {
  OPEN_SPACE_ID,
  PUBLICIZING_REQUEST_EXPIRE_TIME,
  PUBLICIZING_REQUEST_KEY
} from '@libs/constants'
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
import type { PublicizingResponse } from './model/publicizing-response.output'

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
    const requests = await this.cacheManager.get<PublicizingRequest[]>(
      PUBLICIZING_REQUEST_KEY
    )

    if (!requests) {
      return []
    }

    const filteredRequests = requests.filter(
      (req) => new Date(req.expireTime) > new Date()
    )

    if (requests.length != filteredRequests.length) {
      await this.cacheManager.set(
        PUBLICIZING_REQUEST_KEY,
        filteredRequests,
        PUBLICIZING_REQUEST_EXPIRE_TIME
      )
    }

    return filteredRequests
  }

  async handlePublicizingRequest(contestId: number, isAccepted: boolean) {
    const requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<PublicizingRequest>
    if (!requests) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }

    const request = requests.find((req) => req.contestId === contestId)
    if (!request || new Date(request.expireTime) < new Date()) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests.filter((req) => req.contestId != contestId),
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    if (isAccepted) {
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
    }

    return {
      contestId: contestId,
      isAccepted: isAccepted
    } as PublicizingResponse
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

    let requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<PublicizingRequest>
    if (!requests) {
      requests = []
    }

    const duplicatedRequest = requests.find((req) => req.contestId == contestId)
    if (duplicatedRequest) {
      throw new ConflictFoundException('duplicated publicizing request')
    }

    const newRequest: PublicizingRequest = {
      contestId: contestId,
      userId: contest.createdById,
      expireTime: new Date(Date.now() + PUBLICIZING_REQUEST_EXPIRE_TIME)
    }
    requests.push(newRequest)

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests,
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    return newRequest
  }

  async importProblems(
    groupId: number,
    contestId: number,
    problemIds: number[]
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId,
        groupId: groupId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
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
            // 원래 id: 'temp'이었는데, contestProblem db schema field가 바뀌어서
            // 임시 방편으로 order: 0으로 설정합니다.
            order: 0,
            contestId: contestId,
            problemId: problemId
          }
        })
      )
    }

    return contestProblems
  }
}
