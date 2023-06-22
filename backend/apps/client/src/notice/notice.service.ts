import { Injectable } from '@nestjs/common'
import type { Notice } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateNoticeDto } from './dto/create-notice.dto'
import type { UpdateNoticeDto } from './dto/update-notice.dto'
import type { UserNotice } from './interface/user-notice.interface'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(
    noticeDto: CreateNoticeDto,
    userId: number,
    groupId: number
  ): Promise<Notice> {
    await this.prisma.group.findUnique({
      where: {
        id: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const notice = await this.prisma.notice.create({
      data: {
        title: noticeDto.title,
        content: noticeDto.content,
        isVisible: noticeDto.isVisible,
        isFixed: noticeDto.isFixed,
        group: {
          connect: { id: groupId }
        },
        createdBy: {
          connect: { id: userId }
        }
      }
    })

    return notice
  }

  async getNoticesByGroupId(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Notice>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.notice.findMany({
      where: {
        groupId: groupId,
        isVisible: true
      },
      select: {
        id: true,
        title: true,
        createTime: true,
        isFixed: true
      },
      take,
      skip,
      cursor: {
        id: cursor
      }
    })
  }

  async getNotice(id: number, groupId = OPEN_SPACE_ID): Promise<UserNotice> {
    const current = await this.prisma.notice.findFirst({
      where: {
        id: id,
        isVisible: true
      },
      select: {
        title: true,
        content: true,
        createTime: true,
        updateTime: true
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare,
          groupId: groupId,
          isVisible: true
        },
        orderBy: {
          id: options.order
        },
        select: {
          id: true,
          title: true
        }
      }
    }

    return {
      current,
      prev: await this.prisma.notice.findFirst(navigate('prev')),
      next: await this.prisma.notice.findFirst(navigate('next'))
    }
  }

  async getAdminNoticesByGroupId(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Notice>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.notice.findMany({
      where: { groupId },
      select: {
        id: true,
        title: true,
        createdBy: true,
        updateTime: true,
        isVisible: true,
        isFixed: true
      },
      take,
      skip,
      cursor: {
        id: cursor
      }
    })
  }

  async getAdminNotice(id: number): Promise<Partial<Notice>> {
    return await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      select: {
        group: {
          select: {
            groupName: true
          }
        },
        title: true,
        content: true,
        isVisible: true,
        isFixed: true
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })
  }

  async updateNotice(id: number, noticeDto: UpdateNoticeDto): Promise<Notice> {
    await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })

    const notice = await this.prisma.notice.update({
      where: {
        id: id
      },
      data: {
        ...noticeDto
      }
    })

    return notice
  }

  async deleteNotice(id: number) {
    await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })

    await this.prisma.notice.delete({
      where: {
        id: id
      }
    })
  }
}
