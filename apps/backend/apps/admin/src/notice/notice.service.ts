import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(userId: number, createNoticeInput: CreateNoticeInput) {
    return await this.prisma.notice.create({
      data: {
        createdById: userId,
        ...createNoticeInput
      }
    })
  }

  async deleteNotice(noticeId: number) {
    return await this.prisma.notice.delete({
      where: {
        id: noticeId
      }
    })
  }

  async updateNotice(noticeId: number, updateNoticeInput: UpdateNoticeInput) {
    return await this.prisma.notice.update({
      where: {
        id: noticeId
      },
      data: updateNoticeInput
    })
  }

  async getNotice(noticeId: number) {
    return await this.prisma.notice.findUniqueOrThrow({
      where: {
        id: noticeId
      }
    })
  }

  async getNotices(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)
    return await this.prisma.notice.findMany({
      ...paginator,
      take
    })
  }
}
