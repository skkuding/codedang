import { Injectable } from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 대회의 공지 목록을 최신순으로 조회합니다.
   * 공지에 연결된 problemId는 대회 내 문제 순서(problemOrder)로 변환하여 반환하며,
   * 문제와 연결되지 않은 공지는 problemOrder가 null입니다.
   *
   * @param {number} contestId 대회 ID
   * @returns problemId 대신 problemOrder가 포함된 공지 목록
   * @throws {NotFoundException} contestId에 해당하는 대회가 없는 경우 발생합니다.
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
