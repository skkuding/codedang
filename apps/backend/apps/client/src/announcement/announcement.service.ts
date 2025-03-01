import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestAnnouncements(contestId: number): Promise<Announcement[]> {
    const { announcement } = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId
      },
      select: {
        announcement: {
          orderBy: { createTime: 'desc' }
        }
      }
    })
    return announcement
  }
}
