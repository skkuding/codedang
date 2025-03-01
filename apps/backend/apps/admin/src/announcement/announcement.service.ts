import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './model/create-announcement.input'
import type { UpdateAnnouncementInput } from './model/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnouncement(input: CreateAnnouncementInput) {
    const { problemId, contestId, content } = input

    await this.prisma.contest.findUniqueOrThrow({
      where: { id: contestId }
    })

    if (problemId) {
      await this.prisma.problem.findUniqueOrThrow({
        where: { id: problemId }
      })
    }

    return await this.prisma.announcement.create({
      data: {
        problemId,
        contestId,
        content
      }
    })
  }

  async getAnnouncementsByContestId(contestId: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    const problemOrderMap = {}
    contestProblems.forEach((problem, index) => {
      problemOrderMap[problem.problemId] = index
    })

    const announcements = await this.prisma.announcement.findMany({
      where: { contestId },
      orderBy: { createTime: 'desc' }
    })

    return announcements.map((announcement) => {
      return {
        ...announcement,
        problemOrder: announcement.problemId
          ? problemOrderMap[announcement.problemId]
          : null
      }
    })
  }

  async getAnnouncementById(id: number) {
    return await this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  async updateAnnouncement(input: UpdateAnnouncementInput) {
    const { id, ...rest } = input
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.update({
      where: { id },
      data: rest
    })
  }

  async removeAnnouncement(id: number) {
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
