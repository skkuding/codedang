import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestDto } from './dto/contest.dto'

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contestData: ContestDto): Promise<Contest> {
    //TODO: Admin Access Check

    const group = await this.prisma.group.findUnique({
      where: {
        id: contestData.group_id
      }
    })

    if (!group) {
      //TODO: Throw error
      throw new Error('The group does not exist')
    }

    if (contestData.start_time > contestData.end_time) {
      //TODO: Throw error
      throw new Error('The start_time must be earlier than the end_time')
    }

    const contest = await this.prisma.contest.create({
      data: {
        title: contestData.title,
        description: contestData.description,
        start_time: contestData.start_time,
        end_time: contestData.end_time,
        visible: contestData.visible,
        is_rank_visible: contestData.is_rank_visible,
        type: contestData.type,
        group: {
          connect: { id: contestData.group_id }
        },
        created_by: {
          connect: { id: 1 }
        }
      }
    })

    return contest
  }

  async delete(id: number): Promise<string> {
    //TODO: Admin Access Check, Response format
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

    return 'success'
  }

  async update(id: number, contestData: ContestDto): Promise<Contest> {
    //TODO: Admin access check
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
