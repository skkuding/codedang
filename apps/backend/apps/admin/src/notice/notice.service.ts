import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(
    userId: number,
    groupId: number,
    createNoticeInput: CreateNoticeInput
  ) {
    return await this.prisma.notice.create({
      data: {
        createdById: userId,
        groupId,
        ...createNoticeInput
      }
    })
  }

  async deleteNotice(groupId: number, noticeId: number) {
    return await this.prisma.notice.delete({
      where: {
        id: noticeId,
        groupId
      }
    })
  }

  async updateNotice(
    groupId: number,
    noticeId: number,
    updateNoticeInput: UpdateNoticeInput
  ) {
    return await this.prisma.notice.update({
      where: {
        id: noticeId,
        groupId
      },
      data: updateNoticeInput
    })
  }

  async getNotice(groupId: number, noticeId: number) {
    return await this.prisma.notice.findUniqueOrThrow({
      where: {
        id: noticeId,
        groupId
      }
    })
  }

  async getNotices(groupId: number, cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)
    return await this.prisma.notice.findMany({
      ...paginator,
      take,
      where: {
        groupId
      }
    })
  }
}
