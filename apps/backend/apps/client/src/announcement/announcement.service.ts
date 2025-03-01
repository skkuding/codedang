import { Injectable } from '@nestjs/common'
import { Announcement } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestAnnouncements(contestId: number): Promise<Announcement[]> {
    try {
      const { announcement } = await this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: {
          announcement: {
            orderBy: { createTime: 'desc' }
          }
        }
      })
      return announcement
    } catch (error) {
      throw new UnprocessableDataException('ContestId must be provided.')
    }
  }
}
