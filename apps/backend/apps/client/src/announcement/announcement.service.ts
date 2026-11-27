import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets the announcements of a contest, newest first.
   * The problemId of each announcement is converted to its problem order in the contest (problemOrder),
   * and problemOrder is null for announcements not linked to a problem.
   *
   * @param {number} contestId Contest ID
   * @returns Announcements with problemOrder instead of problemId
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 if the contest with contestId does not exist
   */
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
