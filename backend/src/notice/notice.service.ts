import { UserNotice } from './interface/user-notice.interface'
import { Injectable } from '@nestjs/common'
import { Notice } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(
    userId: number,
    groupId: number,
    noticeDto: CreateNoticeDto
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
    groupId: number,
    cursor: number,
    take: number
  ): Promise<Partial<Notice>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.notice.findMany({
      take,
      skip,
      cursor: {
        id: cursor
      },
      where: {
        groupId: groupId,
        isVisible: true
      },
      select: {
        id: true,
        title: true,
        createTime: true,
        isFixed: true
      }
    })
  }

  async getNotice(id: number, groupId: number): Promise<UserNotice> {
    const current = await this.prisma.notice.findFirst({
      where: {
        id,
        groupId, // 수정
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

  async getAdminNotices(
    cursor: number,
    take: number
  ): Promise<Partial<Notice>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.notice.findMany({
      take,
      skip,
      cursor: {
        id: cursor
      },
      where: {
        groupId: 1
      },
      select: {
        id: true,
        group: {
          select: {
            id: true,
            groupName: true
          }
        },
        title: true,
        updateTime: true,
        createdBy: true,
        isVisible: true
      }
    })
  }

  async getAdminNoticesByGroupId(
    groupId: number,
    take: number,
    cursor: number
  ): Promise<Partial<Notice>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.notice.findMany({
      take,
      skip,
      cursor: {
        id: cursor
      },
      where: {
        groupId: groupId
      },
      select: {
        id: true,
        title: true,
        updateTime: true,
        isVisible: true,
        isFixed: true
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
