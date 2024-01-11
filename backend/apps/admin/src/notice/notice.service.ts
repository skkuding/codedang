import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Notice } from '@admin/@generated'
import { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(
    userId: number,
    groupId: number,
    notice: CreateNoticeInput
  ): Promise<Notice> {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }

    const newNotice: Notice = await this.prisma.notice.create({
      data: {
        createdById: userId,
        title: notice.title,
        content: notice.content,
        isVisible: notice.isVisible,
        isFixed: notice.isFixed,
        groupId
      }
    })

    return newNotice
  }

  async deleteNotice(groupId: number, noticeId: number) {
    const notice = await this.prisma.notice.findFirst({
      where: {
        id: noticeId,
        groupId
      }
    })
    if (!notice) {
      throw new EntityNotExistException('notice')
    }

    await this.prisma.contest.delete({
      where: {
        id: noticeId
      }
    })

    return notice
  }

  async updateContest(
    groupId: number,
    notice: UpdateNoticeInput
  ): Promise<Notice> {
    const noticeFound = await this.prisma.notice.findFirst({
      where: {
        id: notice.id,
        groupId
      }
    })
    if (!noticeFound) {
      throw new EntityNotExistException('notice')
    }

    return await this.prisma.notice.update({
      where: {
        id: notice.id
      },
      data: {
        title: notice.title,
        content: notice.content,
        isVisible: notice.isFixed,
        isFixed: notice.isFixed
      }
    })
  }
}
