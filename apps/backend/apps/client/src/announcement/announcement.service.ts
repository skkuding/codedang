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

  async getAssignmentAnnouncements(
    assignmentId: number,
    groupId: number
  ): Promise<Announcement[]> {
    const { assignmentProblem, announcement } =
      await this.prisma.assignment.findUniqueOrThrow({
        where: {
          id: assignmentId,
          groupId
        },
        select: {
          assignmentProblem: true,
          announcement: {
            orderBy: { updateTime: 'desc' }
          }
        }
      })

    return announcement.map((announcement) => {
      if (announcement.problemId !== null) {
        announcement.problemId = assignmentProblem.find(
          (problem) => announcement.problemId === problem.problemId
        )!.order
      }
      return announcement
    })
  }

  async getProblemAnnouncements(
    contestId: number | null,
    assignmentId: number | null,
    problemId: number,
    groupId: number
  ): Promise<Announcement[]> {
    if (contestId) {
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
    } else if (assignmentId) {
      return await this.prisma.announcement.findMany({
        where: {
          problemId,
          assignment: {
            id: assignmentId,
            groupId
          }
        },
        orderBy: { updateTime: 'desc' }
      })
    }
    return []
  }
}
