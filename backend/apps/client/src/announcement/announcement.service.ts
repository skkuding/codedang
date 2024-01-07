import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemAnnouncements(
    problemId: number,
    groupId: number
  ): Promise<Announcement[]> {
    const result = await this.prisma.announcement.findMany({
      where: {
        problem: {
          id: problemId,
          groupId
        }
      },
      orderBy: { updateTime: 'desc' }
    })

    return result
  }

  async getContestAnnouncements(
    contestId: number,
    groupId: number
  ): Promise<Announcement[]> {
    const result = await this.prisma.announcement.findMany({
      where: {
        problem: {
          contestProblem: {
            some: {
              contestId
            }
          },
          groupId
        }
      },
      orderBy: { updateTime: 'desc' }
    })

    return result
  }
}
