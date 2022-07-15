import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestDto } from './dto/contest.dto'

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async createContest(
    userId: number,
    contestData: ContestDto
  ): Promise<Contest> {
    // TODO: Guard로 만들기
    /*
    const groupId = contestData.group_id
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })

    if (!group) {
      throw new Error('The group does not exist')
    }

    if (!this.groupService.isUserGroupManager(userId, groupId)) {
      throw new Error('Permission denied')
    }
    */

    if (!this.isValidPeriod(contestData.start_time, contestData.end_time)) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const contest = await this.prisma.contest.create({
      data: {
        title: contestData.title,
        description: contestData.description,
        description_summary: contestData.description_summary,
        start_time: contestData.start_time,
        end_time: contestData.end_time,
        visible: contestData.visible,
        is_rank_visible: contestData.is_rank_visible,
        type: contestData.type,
        group: {
          connect: { id: contestData.group_id }
        },
        created_by: {
          connect: { id: userId }
        }
      }
    })

    return contest
  }

  async deleteContest(contestId: number) {
    const contest = await this.prisma.contest.findUnique({
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

  async updateContest(
    contestId: number,
    contestData: ContestDto
  ): Promise<Contest> {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    if (contest.group_id != contestData.group_id) {
      throw new UnprocessableDataException('Group cannot be changed')
    }

    if (!this.isValidPeriod(contestData.start_time, contestData.end_time)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    const updated_contest = await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...contestData
      }
    })

    return updated_contest
  }
}
