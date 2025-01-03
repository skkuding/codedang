import { Injectable } from '@nestjs/common'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices({
    cursor,
    take,
    search,
    fixed = false,
    groupId = OPEN_SPACE_ID
  }: {
    cursor: number | null
    take: number
    search?: string
    fixed?: boolean
    groupId?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const notices = await this.prisma.notice.findMany({
      ...paginator,
      where: {
        groupId,
        isVisible: true,
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      },
      take,
      select: {
        id: true,
        title: true,
        createTime: true,
        isFixed: true,
        createdBy: {
          select: {
            username: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    const data = notices.map((notice) => {
      return {
        ...notice,
        createdBy: notice.createdBy?.username
      }
    })
    const total = await this.prisma.notice.count({
      where: {
        groupId,
        isVisible: true,
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    return { data, total }
  }

  async getNoticeByID(id: number, groupId = OPEN_SPACE_ID) {
    const notice = await this.prisma.notice.findUnique({
      where: {
        id,
        groupId,
        isVisible: true
      },
      select: {
        title: true,
        content: true,
        createTime: true,
        updateTime: true,
        createdBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (!notice) {
      throw new EntityNotExistException('notice')
    }
    const current = { ...notice, createdBy: notice.createdBy?.username }

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare,
          groupId,
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
