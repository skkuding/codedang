import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

const PUBLIC = 1

function returnTextIsNotAllowed(user_id: number, contest_id: number): string {
  return `Contest ${contest_id} is not allowed to User ${user_id}`
}

const contestListselectOption = {
  id: true,
  title: true,
  description: true,
  start_time: true,
  end_time: true,
  visible: true,
  group_id: true,
  type: true
}
const userContestListPageOption = {
  where: { visible: true },
  select: contestListselectOption
}

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  filterOngoing(allContest) {
    const now = new Date()
    const ongoingContest = allContest.filter(
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }

  /* public */
  async getOngoingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    return this.filterOngoing(allContest)
  }

  async getUpcomingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.start_time > new Date()
    )
    return returnContest
  }

  async getFinishedContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.end_time <= new Date()
    )
    return returnContest
  }

  async getContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: contestListselectOption
    })
    if (!contest) {
      throw new EntityNotExistException(`Contest ${contest_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id: contest.group_id, is_registered: true },
      select: { is_group_manager: true }
    })
    if (
      (!isUserInGroup && contest.end_time > new Date()) ||
      (contest.visible == false && isUserInGroup.is_group_manager == false)
    ) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }
    return contest
  }

  // Todo: issue #90
  async createContestRecord(
    user_id: number,
    contest_id: number,
    group_id: number
  ): Promise<null | Error> {
    //contest 존재 여부
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { start_time: true, end_time: true, type: true }
    })
    if (!contest) {
      throw new EntityNotExistException(`Contest ${contest_id}`)
    }

    //중복 참여 확인 in contestRecord
    const isAlreadyRecord = await this.prisma.contestRecord.findFirst({
      where: { user_id, contest_id },
      select: { id: true }
    })
    if (isAlreadyRecord) {
      throw new InvalidUserException(
        `User ${user_id} is already participated in Contest ${contest_id}`
      )
    }

    //contest private여부 확인
    if (group_id !== PUBLIC) {
      //user group인지 확인
      const isUserInGroup = await this.prisma.userGroup.findFirst({
        where: { user_id, group_id: group_id, is_registered: true },
        select: { id: true }
      })
      //contest group 확인
      if (!isUserInGroup) {
        throw new InvalidUserException(
          returnTextIsNotAllowed(user_id, contest_id)
        )
      }
    }

    //contest start 전 or contest end 후 -> throw
    const now = new Date()
    if (now < contest.start_time || now >= contest.end_time) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }

    //contest type ACM -> create contestRankACM record
    if (contest.type === 'ACM') {
      await this.prisma.contestRankACM.create({
        data: { contest_id, user_id }
      })
    }
    // Todo: other contest type -> create other contest record table
    return
  }

  /* group */
  async getContestsByGroupId(user_id: number, group_id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: group_id }
    })
    if (!group) {
      throw new EntityNotExistException(`Group ${group_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id, is_registered: true }
    })
    if (!isUserInGroup) {
      throw new InvalidUserException(
        `User ${user_id} is not in Group ${group_id}`
      )
    }
    return await this.prisma.contest.findMany({
      where: { group_id, visible: true },
      select: contestListselectOption
    })
  }

  /* admin */
  async getAdminContests(user_id: number) {
    const isUserGroupManager = await this.prisma.userGroup.findMany({
      where: { user_id, is_group_manager: true },
      select: { group_id: true }
    })
    if (!isUserGroupManager) {
      throw new InvalidUserException(`User ${user_id} is not group manager`)
    }
    const groupIdList = isUserGroupManager.map((groupId) => groupId.group_id)
    return await this.prisma.group.findMany({
      where: {
        id: { in: groupIdList }
      },
      select: {
        id: true,
        group_name: true,
        Contest: true
      }
    })
  }

  async getAdminOngoingContests(user_id: number) {
    const result = await this.getAdminContests(user_id)
    if (!result) {
      throw new InvalidUserException(`User ${user_id} is not group manager`)
    }
    for (const group of result) {
      group.Contest = this.filterOngoing(group.Contest)
    }
    return result
  }

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
    const contest: Contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    const updated_contest: Contest = await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...contestDto
      }
    })

    return updated_contest
  }

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async deleteContest(contestId: number) {
    const contest: Contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
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
  }
}
