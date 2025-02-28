import { Injectable } from '@nestjs/common'
import type { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './dto/create-announcement.input'
import type { UpdateAnnouncementInput } from './dto/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAnnouncementInput: CreateAnnouncementInput) {
    return this.prisma.announcement.create({
      data: createAnnouncementInput
    })
  }

  findAll() {
    return this.prisma.announcement.findMany()
  }

  findOne(id: number) {
    return this.prisma.announcement.findUniqueOrThrow({
      where: { id }
    })
  }

  findByProblemId(problemId: number) {
    return this.prisma.announcement.findMany({
      where: { problemId },
      orderBy: { createTime: 'desc' },
      select: { id: true, content: true, createTime: true, updateTime: true }
    })
  }

  findByContestId(contestId: number) {
    return this.prisma.announcement.findMany({
      where: { contestId },
      orderBy: { createTime: 'desc' },
      select: { id: true, content: true, createTime: true, updateTime: true }
    })
  }

  update(id: number, updateAnnouncementInput: UpdateAnnouncementInput) {
    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementInput
    })
  }

  remove(id: number) {
    // return `This action removes a #${id} announcement`
    return this.prisma.announcement.delete({
      where: { id }
    })
  }
}
