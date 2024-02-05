import { Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
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
    try {
      return await this.prisma.notice.create({
        data: {
          createdById: userId,
          groupId,
          ...createNoticeInput
        }
      })
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new EntityNotExistException('Group')
      }
      throw error
    }
  }

  async deleteNotice(groupId: number, noticeId: number) {
    try {
      return await this.prisma.notice.delete({
        where: {
          id: noticeId,
          groupId
        }
      })
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Notice')
      }
      throw error
    }
  }

  async updateNotice(
    groupId: number,
    noticeId: number,
    updateNoticeInput: UpdateNoticeInput
  ) {
    try {
      return await this.prisma.notice.update({
        where: {
          id: noticeId,
          groupId
        },
        data: updateNoticeInput
      })
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Notice')
      }
      throw error
    }
  }

  async getNotice(groupId: number, noticeId: number) {
    const notice = await this.prisma.notice.findFirst({
      where: {
        id: noticeId,
        groupId
      }
    })
    if (notice == null) {
      throw new EntityNotExistException('Notice')
    }
    return notice
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
