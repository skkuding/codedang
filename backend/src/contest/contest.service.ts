import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestDto } from './dto/contest.dto'

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (contestData.start_time > contestData.end_time) {
      throw new Error('The start_time must be earlier than the end_time')
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

  async deleteContest(id: number) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id
      }
    })

    if (!contest) {
      throw new Error('The contest does not exist')
    }

    await this.prisma.contest.delete({
      where: {
        id
      }
    })
  }

  async updateContest(id: number, contestData: ContestDto): Promise<Contest> {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id
      }
    })

    if (!contest) {
      throw new Error('The contest does not exist')
    }

    if (contest.group_id != contestData.group_id) {
      throw new Error('Group cannot be changed')
    }

    if (contestData.start_time > contestData.end_time) {
      throw new Error('start time must be earlier than end time')
    }

    const updated_contest = await this.prisma.contest.update({
      where: {
        id
      },
      data: {
        ...contestData
      }
    })

    return updated_contest
  }
}
