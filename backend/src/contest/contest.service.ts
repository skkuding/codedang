import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService
  ) {}

  private contestSelectOption = {
    id: true,
    title: true,
    start_time: true,
    end_time: true,
    type: true,
    group: { select: { group_id: true, group_name: true } }
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
        description_summary: contestDto.descriptionSummary,
        start_time: contestDto.startTime,
        end_time: contestDto.endTime,
        visible: contestDto.visible,
        is_rank_visible: contestDto.isRankVisible,
        type: contestDto.type,
        group: {
          connect: { id: contestDto.groupId }
        },
        created_by: {
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
        description_summary: contestDto.description,
        start_time: contestDto.startTime,
        end_time: contestDto.endTime,
        visible: contestDto.visible,
        is_rank_visible: contestDto.isRankVisible,
        type: contestDto.type
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
      where: { visible: true },
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
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }

  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.start_time > now
    )
    return ongoingContest
  }

  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter((contest) => contest.end_time <= now)
    return ongoingContest
  }

  async getContestById(
    userId: number,
    contestId: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { ...this.contestSelectOption, description: true, visible: true },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    const userGroup = await this.groupService.getUserGroupMembershipInfo(
      userId,
      contest.group.group_id
    )
    const isUserGroupMember = userGroup && userGroup.is_registered
    const now = new Date()

    if (!isUserGroupMember && contest.end_time > now) {
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
        title: true,
        description_summary: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getContestsByGroupId(groupId: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id: groupId, visible: true },
      select: this.contestSelectOption
    })
  }

  async getAdminOngoingContests(userId: number): Promise<Partial<Contest>[]> {
    const contests = await this.getAdminContests(userId)
    return this.filterOngoing(contests)
  }

  async getAdminContests(userId: number): Promise<Partial<Contest>[]> {
    const groupIds = await this.groupService.getUserGroupManagerList(userId)
    return await this.prisma.contest.findMany({
      where: {
        group_id: { in: groupIds }
      },
      select: { ...this.contestSelectOption, visible: true }
    })
  }

  async getAdminContestById(contestId: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        ...this.contestSelectOption,
        visible: true,
        description: true,
        description_summary: true,
        is_rank_visible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getAdminContestsByGroupId(
    groupId: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id: groupId },
      select: { ...this.contestSelectOption, visible: true }
    })
  }
}
