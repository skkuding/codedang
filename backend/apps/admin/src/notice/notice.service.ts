import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from '@libs/exception'
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
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }

    return await this.prisma.notice.create({
      data: {
        createdById: userId,
        groupId,
        ...createNoticeInput
      }
    })
  }

  async deleteNotice(groupId: number, noticeId: number) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }

    const notice = await this.prisma.notice.findFirst({
      where: {
        id: noticeId,
        groupId
      }
    })
    if (!notice) {
      throw new EntityNotExistException('Notice')
    }

    return await this.prisma.notice.delete({
      where: {
        id: noticeId,
        groupId
      }
    })
  }

  async updateNotice(
    groupId: number,
    { id, ...restUpdateNoticeInput }: UpdateNoticeInput
  ) {
    const noticeFound = await this.prisma.notice.findFirst({
      where: {
        id,
        groupId
      }
    })
    if (!noticeFound) {
      throw new EntityNotExistException('Notice')
    }

    return await this.prisma.notice.update({
      where: {
        id
      },
      data: restUpdateNoticeInput
    })
  }
}
