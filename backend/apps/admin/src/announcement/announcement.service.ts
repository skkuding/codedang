import { Injectable, Logger } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  EntityNotExistException,
  DuplicateFoundException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { AnnouncementInput } from './dto/announcement.input'

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name)

  constructor(private readonly prisma: PrismaService) {}

  async createAnnouncement(
    announcementInput: AnnouncementInput
  ): Promise<AnnouncementInput> {
    const announcement = await this.prisma.announcement.findFirst({
      where: {
        problemId: announcementInput.problemId,
        content: announcementInput.content
      }
    })
    if (announcement) throw new DuplicateFoundException('announcement')

    await this.prisma.problem
      .findFirstOrThrow({
        where: {
          id: announcementInput.problemId
        }
      })
      .catch((error) => {
        if (error.name == 'NotFoundError') {
          throw new EntityNotExistException('problem')
        }
      })

    return await this.prisma.announcement.create({
      data: {
        problemId: announcementInput.problemId,
        content: announcementInput.content
      }
    })
  }

  async getAnnouncementsByProblemId(problemId: number) {
    return await this.prisma.announcement.findMany({
      where: {
        problemId
      }
    })
  }

  async getAnnouncement(id: number) {
    const announcement = await this.prisma.announcement
      .findFirstOrThrow({
        where: {
          id
        }
      })
      .catch((error) => {
        if (error.name == 'NotFoundError') {
          throw new EntityNotExistException('announcement')
        }
      })
    return announcement
  }

  async updateAnnouncement(id: number, announcementInput: AnnouncementInput) {
    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: announcementInput
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new EntityNotExistException('announcement')
      }
    }
  }

  async removeAnnouncement(id: number) {
    try {
      return await this.prisma.announcement.delete({
        where: { id }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new EntityNotExistException('announcement')
      }
    }
  }
}
