import { Injectable, NotFoundException } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemAnnouncements(
    problemId: number,
    groupId: number
  ): Promise<Partial<Announcement>[]> {
    const result = await this.prisma.announcement.findMany({
      where: {
        problem: {
          id: problemId,
          groupId
        }
      },
      orderBy: { id: 'asc' }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }

  async getContestAnnouncements(
    contestId: number,
    groupId: number
  ): Promise<Partial<Announcement>[]> {
    const result = await this.prisma.announcement.findMany({
      where: {
        problem: {
          contestProblem: {
            every: {
              contestId
            }
          },
          groupId
        }
      },
      orderBy: { id: 'asc' }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }
}
