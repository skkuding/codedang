import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

function returnTextIsNotAllowed(user_id: number, contest_id: number): string {
  return `Contest ${contest_id} is not allowed to User ${user_id}`
}

const contestSelectOptionPartial = {
  id: true,
  title: true,
  start_time: true,
  end_time: true,
  type: true,
  group: { select: { group_name: true } }
}

const contestSelectOption = {
  ...contestSelectOptionPartial,
  group_id: true,
  description: true,
  visible: true
}

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly group: GroupService
  ) {}

  async createContest(
    userId: number,
    contestDto: CreateContestDto
  ): Promise<Contest> {
    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const contest: Contest = await this.prisma.contest.create({
      data: {
        title: contestDto.title,
        description: contestDto.description,
        description_summary: contestDto.description_summary,
        start_time: contestDto.start_time,
        end_time: contestDto.end_time,
        visible: contestDto.visible,
        is_rank_visible: contestDto.is_rank_visible,
        type: contestDto.type,
        group: {
          connect: { id: contestDto.group_id }
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

    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    return await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...contestDto
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

  ///////////////////////////////////////////////////////////////////////////////

  filterOngoing(contests: Partial<Contest>[]): Partial<Contest>[] {
    const now = new Date()
    const ongoingContest = contests.filter(
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }
  filterUpcoming(contests: Partial<Contest>[]): Partial<Contest>[] {
    const ongoingContest = contests.filter(
      (contest) => contest.start_time > new Date()
    )
    return ongoingContest
  }
  filterFinished(contests: Partial<Contest>[]): Partial<Contest>[] {
    const ongoingContest = contests.filter(
      (contest) => contest.end_time <= new Date()
    )
    return ongoingContest
  }

  async getContests(): Promise<{
    ongoing: Partial<Contest>[]
    upcoming: Partial<Contest>[]
    finished: Partial<Contest>[]
  }> {
    const contests = await this.prisma.contest.findMany({
      where: { visible: true },
      select: contestSelectOptionPartial
    })
    return {
      ongoing: this.filterOngoing(contests),
      upcoming: this.filterUpcoming(contests),
      finished: this.filterFinished(contests)
    }
  }

  async getContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: contestSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id: contest.group_id, is_registered: true },
      select: { is_group_manager: true }
    })
    if (
      (!isUserInGroup && contest.end_time > new Date()) ||
      (contest.visible == false && isUserInGroup.is_group_manager == false)
    ) {
      throw new UnprocessableDataException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }
    return contest
  }

  async getModalContestById(contest_id: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        id: true,
        title: true,
        description_summary: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getContestsByGroupId(group_id: number): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id, visible: true },
      select: contestSelectOption
    })
  }

  ///////////////////////////////////////////////////////////////////////////////////

  async getAdminContests(user_id: number): Promise<Partial<Contest>[]> {
    const groupIds = await this.group.getUserGroupManagerList(user_id)
    return await this.prisma.contest.findMany({
      where: {
        group_id: { in: groupIds }
      },
      select: contestSelectOption
    })
  }

  async getAdminOngoingContests(user_id: number): Promise<Partial<Contest>[]> {
    const contests = await this.getAdminContests(user_id)
    return this.filterOngoing(contests)
  }

  async getAdminContestById(contest_id: number): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        ...contestSelectOption,
        description_summary: true,
        is_rank_visible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('Contest')
    })

    return contest
  }

  async getAdminContestsByGroupId(
    group_id: number
  ): Promise<Partial<Contest>[]> {
    return await this.prisma.contest.findMany({
      where: { group_id },
      select: contestSelectOptionPartial
    })
  }
}
