import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestAnnouncements(
    contestId: number
  ): Promise<
    (Omit<Announcement, 'problemId'> & { problemOrder: number | null })[]
  > {
    const { contestProblem, announcement } =
      await this.prisma.contest.findUniqueOrThrow({
        where: {
          id: contestId
        },
        select: {
          contestProblem: true,
          announcement: {
            orderBy: { createTime: 'desc' }
          }
        }
      })

    return announcement.map(({ problemId, ...rest }) => {
      return {
        ...rest,
        problemOrder:
          problemId !== null
            ? (contestProblem.find((problem) => problemId === problem.problemId)
                ?.order ?? null)
            : null
      }
    })
  }
}
