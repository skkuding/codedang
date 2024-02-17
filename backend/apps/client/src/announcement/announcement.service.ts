import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestAnnouncements(
    contestId: number,
    groupId: number
  ): Promise<Announcement[]> {
    const { contestProblem, announcement } =
      await this.prisma.contest.findUniqueOrThrow({
        where: {
          id: contestId,
          groupId
        },
        select: {
          contestProblem: true,
          announcement: {
            orderBy: { updateTime: 'desc' }
          }
        }
      })

    return announcement.map((announcement) => {
      if (announcement.problemId !== null) {
        announcement.problemId = contestProblem.find(
          (problem) => announcement.problemId === problem.problemId
        )!.order
      }
      return announcement
    })
  }

  async getProblemAnnouncements(
    contestId: number,
    problemId: number,
    groupId: number
  ): Promise<Announcement[]> {
    return await this.prisma.announcement.findMany({
      where: {
        problemId,
        contest: {
          id: contestId,
          groupId
        }
      },
      orderBy: { updateTime: 'desc' }
    })
  }
}
