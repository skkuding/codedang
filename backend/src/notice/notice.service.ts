import { UserNotice } from './interface/user-notice.interface'
import { Injectable } from '@nestjs/common'
import { Notice } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupService } from 'src/group/group.service'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly group: GroupService
  ) {}

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
        visible: noticeDto.visible,
        fixed: noticeDto.fixed,
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
    offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        groupId: groupId,
        visible: true
      },
      select: {
        id: true,
        title: true,
        createTime: true,
        fixed: true
      },
      skip: offset - 1,
      take: 10
    })
  }

  async getNotice(id: number, groupId: number): Promise<UserNotice> {
    const current = await this.prisma.notice.findFirst({
      where: {
        id: id,
        visible: true
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
          visible: true
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
    userId: number,
    offset: number
  ): Promise<Partial<Notice>[]> {
    const groupIds = await this.group.getManagingGroupIds(userId)

    return await this.prisma.notice.findMany({
      where: {
        groupId: {
          in: groupIds
        }
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
        visible: true
      },
      skip: offset - 1,
      take: 5
    })
  }

  async getAdminNoticesByGroupId(
    groupId: number,
    offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        groupId: groupId
      },
      select: {
        id: true,
        title: true,
        updateTime: true,
        visible: true,
        fixed: true
      },
      skip: offset - 1,
      take: 5
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
        visible: true,
        fixed: true
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
