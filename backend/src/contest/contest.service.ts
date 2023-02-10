import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { Cache } from 'cache-manager'
import { contestPublicizingRequestKey } from 'src/common/cache/keys'
import { PUBLICIZING_REQUEST_EXPIRE_TIME } from 'src/common/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  ForbiddenAccessException,
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
    type: true,
    group: { select: { id: true, groupName: true } }
  }

  async createContest(
    userId: number,
    contestDto: CreateContestDto
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

  async getContests(): Promise<{
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    const contests = await this.prisma.contest.findMany({
      where: {
        config: {
          path: ['isVisible'],
          equals: true
        }
      },
      select: this.contestSelectOption
    })
    return {
      ongoing: this.filterOngoing(contests),
      upcoming: this.filterUpcoming(contests),
      finished: this.filterFinished(contests)
    }
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
    const ongoingContest = contests.filter((contest) => contest.startTime > now)
    return ongoingContest
  }

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter((contest) => contest.endTime <= now)
    return ongoingContest
  }

  async getContestById(
    userId: number,
    contestId: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        ...this.contestSelectOption,
        description: true,
        config: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    const userGroup = await this.groupService.getUserGroup(
      userId,
      contest.group.id
    )
    const now = new Date()

    if (!userGroup && contest.endTime > now) {
      throw new ForbiddenAccessException(
        'Before the contest is ended, only group members can access'
      )
    }

    return contest
  }

  async getModalContestById(contestId: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        id: true,
        title: true
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    return contest
  }

  async getContestsByGroupId(groupId: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: {
        groupId,
        config: {
          path: ['isVisible'],
          equals: true
        }
      },
      select: this.contestSelectOption
    })
  }

  async getAdminContests(): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: {
        groupId: 1
      },
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

  async getAdminContestsByGroupId(
    groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { groupId },
      select: { ...this.contestSelectOption, config: true }
    })
  }

  async createContestPublicizingRequest(userId: number, contestId: number) {
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
        groupId: 1
      }
    })
  }

  async createContestRecord(userId: number, contestId: number) {
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

  async isPublicAndVisibleContest(contestId: number): Promise<boolean> {
    return !!(await this.prisma.contest.count({
      where: {
        id: contestId,
        visible: true,
        isPublic: true
      }
    }))
  }

  async isVisibleContestOfGroup(
    groupId: number,
    contestId: number
  ): Promise<boolean> {
    return !!(await this.prisma.contest.count({
      where: {
        id: contestId,
        visible: true,
        groupId: groupId
      }
    }))
  }
}
