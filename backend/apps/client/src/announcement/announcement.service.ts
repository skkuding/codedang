import { Injectable, NotFoundException } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'
import { SortOrder } from '@admin/@generated'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  // async getContestAnnouncements(
  //   contestId: number,
  //   groupId?: number
  // ): Promise<Partial<ContestAnnouncement>[]> {
  //   return await this.prisma.announcement.findMany({
  //     where: {
  //       contestAnnouncement: {
  //         some: {
  //           contestId,
  //           contest: {
  //             groupId
  //           }
  //         }
  //       }
  //     },
  //     orderBy: { id: SortOrder.asc }
  //   })
  // }

  async getProblemAnnouncements(
    contestId = 0,
    problemId = 0,
    groupId?: number
  ): Promise<Partial<Announcement>[]> {
    interface ProblemAnnouncementWhereInput {
      problemId: number
    }

    let problemsId: Array<ProblemAnnouncementWhereInput> = []
    if (contestId) {
      const contestProblem = await this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { contestProblem: true }
      })
      problemsId = contestProblem.contestProblem.map((problem) => {
        return { problemId: Number(problem.id) }
      })
    }

    if (problemId != 0 && !problemsId.includes({ problemId })) {
      problemsId.push({ problemId })
    }

    const result = await this.prisma.announcement.findMany({
      where: {
        problem: {
          id: problemId,
          groupId
        }
      },
      orderBy: { id: SortOrder.asc }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }
}
