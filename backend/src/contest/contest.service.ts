import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Contest, ContestType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    contestData: CreateContestDto
  ): Promise<Contest> {
    //TODO: user=group_admin&this group's admin
    const group = this.prisma.group.findUnique({
      where: {
        id: contestData.group_id
      }
    })
    if (!group) {
      throw new HttpException(
        'The group does not exist',
        HttpStatus.BAD_REQUEST
      )
    }

    if (contestData.start_time > contestData.end_time) {
      throw new HttpException(
        'start time must be earlier than end time',
        HttpStatus.BAD_REQUEST
      )
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
          connect: { id: userId }
        }
      }
    })

    return contest
  }
}
