import { Injectable, NotFoundException } from '@nestjs/common'
import type { ProblemAnnouncement, ContestAnnouncement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestAnnouncements(
    contestId: number,
    groupId?: number
  ): Promise<Partial<ContestAnnouncement>[]> {
    return await this.prisma.contestAnnouncement.findMany({
      where: {
        contestId: contestId,
        contest: {
          groupId
        }
      }
    })
  }

  async getProblemAnnouncements(
    contestId = 0,
    problemId = 0,
    groupId?: number
  ): Promise<Partial<ProblemAnnouncement>[]> {
    interface ProblemAnnouncementWhereInput {
      problemId: number
    }

    let problemsId: Array<ProblemAnnouncementWhereInput>
    if (contestId) {
      const contestProblem = await this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { contestProblem: true }
      })
      problemsId = contestProblem.contestProblem.map((problem) => {
        return { problemId: Number(problem.id) }
      })
    }

    if (!problemsId.includes({ problemId })) {
      problemsId.push({ problemId })
    }

    const result = await this.prisma.problemAnnouncement.findMany({
      where: {
        OR: problemsId,
        problem: {
          groupId
        }
      }
    })

    if (!result) {
      throw new NotFoundException('no corresponding announcement')
    }

    return result
  }
}
