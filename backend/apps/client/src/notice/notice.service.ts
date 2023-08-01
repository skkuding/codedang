import { Injectable } from '@nestjs/common'
import type { Notice } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getNotice(id: number, groupId = OPEN_SPACE_ID) {
    const current = await this.prisma.notice.findFirst({
      where: {
        id,
        groupId,
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
}
