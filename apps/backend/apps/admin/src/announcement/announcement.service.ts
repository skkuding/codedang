import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './model/create-announcement.input'
import type { UpdateAnnouncementInput } from './model/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnouncement(createAnnouncementInput: CreateAnnouncementInput) {
    const { problemId, contestId, content } = createAnnouncementInput

    await this.prisma.contest.findUniqueOrThrow({
      where: { id: contestId }
    })

    return await this.prisma.announcement.create({
      data: {
        problemId,
        contestId,
        content
      }
    })
  }

  async getAllAnnouncements() {
    return await this.prisma.announcement.findMany()
  }

  async getAnnouncementsByContestId(contestId: number) {
    await this.prisma.contest.findUniqueOrThrow({ where: { id: contestId } })

    return await this.prisma.announcement.findMany({
      where: { contestId },
      orderBy: { createTime: 'desc' },
      select: { id: true, content: true, createTime: true, updateTime: true }
    })
  }

  async getAnnouncementById(id: number) {
    return await this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  async updateAnnouncement(updateAnnouncementInput: UpdateAnnouncementInput) {
    const { id } = updateAnnouncementInput
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementInput
    })
  }

  async removeAnnouncement(id: number) {
    await this.prisma.announcement.findUniqueOrThrow({ where: { id } })

    return await this.prisma.announcement.delete({
      where: { id }
    })
  }
}
