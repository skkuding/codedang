import { Injectable } from '@nestjs/common'
import { OPEN_SPACE_ID } from '@libs/constants'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices({
    cursor,
    take,
    fixed = false,
    groupId = OPEN_SPACE_ID
  }: {
    cursor: number | null
    take: number
    fixed?: boolean
    groupId?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const notices = await this.prisma.notice.findMany({
      ...paginator,
      where: {
        groupId,
        isVisible: true,
        isFixed: fixed
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
      }
    })

    return notices.map((notice) => {
      return {
        ...notice,
        createdBy: notice.createdBy?.username
      }
    })
  }

  async getNoticeByID(id: number, groupId = OPEN_SPACE_ID) {
    const current = await this.prisma.notice
      .findUniqueOrThrow({
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
      .then((notice) => {
        return { ...notice, createdBy: notice.createdBy?.username }
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
