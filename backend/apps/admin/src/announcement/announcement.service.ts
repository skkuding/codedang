import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateAnnouncementInput } from './dto/create-announcement.input'
import type { UpdateAnnouncementInput } from './dto/update-announcement.input'

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    announcement: CreateAnnouncementInput
  ): Promise<CreateAnnouncementInput> {
    await this.prisma.announcement.create({
      data: {
        problemId: announcement.problemId,
        content: announcement.content
      }
    })
    return announcement
  }

  async findAll(problemId: number) {
    return await this.prisma.announcement.findMany({
      where: {
        problemId
      }
    })
  }

  async findOne(id: number) {
    return await this.prisma.announcement.findFirstOrThrow({
      where: {
        id
      }
    })
  }

  update(id: number, updateAnnouncementInput: UpdateAnnouncementInput) {
    return updateAnnouncementInput
  }

  remove(id: number) {
    return `This action removes a #${id} announcement`
  }
}
