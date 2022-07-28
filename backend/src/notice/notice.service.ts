import { UserNotice } from './interface/user-notice.interface'
import { Injectable } from '@nestjs/common'
import { Notice } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { RequestNoticeDto } from './dto/request-notice.dto'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(
    userId: number,
    noticeDto: RequestNoticeDto
  ): Promise<Notice> {
    const group = await this.prisma.group.findUnique({
      where: {
        id: noticeDto.group_id
      }
    })
    if (!group) {
      throw new EntityNotExistException('group')
    }

    const notice = await this.prisma.notice.create({
      data: {
        title: noticeDto.title,
        content: noticeDto.content,
        visible: noticeDto.visible,
        fixed: noticeDto.fixed,
        group: {
          connect: { id: noticeDto.group_id }
        },
        created_by: {
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
        group_id: groupId,
        visible: true
      },
      select: {
        id: true,
        title: true,
        create_time: true
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
        create_time: true,
        update_time: true
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
    })
    const notice = { current: current }

    notice['prev'] = await this.prisma.notice.findFirst({
      where: {
        id: {
          lt: id
        },
        group_id: groupId,
        visible: true
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true,
        title: true
      }
    })

    notice['next'] = await this.prisma.notice.findFirst({
      where: {
        id: {
          gt: id
        },
        group_id: groupId,
        visible: true
      },
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true,
        title: true
      }
    })

    return notice
  }

  async getAdminNoticesByGroupId(
    groupId: number,
    offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        group_id: groupId
      },
      select: {
        id: true,
        title: true,
        update_time: true,
        fixed: true,
        visible: true
      },
      skip: offset - 1,
      take: 5
    })
  }

  async getGroup(id: number): Promise<Partial<Notice>> {
    return await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      select: {
        group_id: true
      },
      rejectOnNotFound: () => new EntityNotExistException('notice')
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
            group_name: true
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

  async getAdminNotices(
    // TODO: user가 admin으로 있는 group list 가져오는 기능 구현
    //       id param에서 삭제할 것
    id: number,
    offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        created_by_id: id
      },
      select: {
        id: true,
        group: {
          select: {
            id: true, // TODO: 리디렉션으로 구현할 경우 삭제
            group_name: true
          }
        },
        title: true,
        update_time: true,
        created_by: true,
        visible: true
      },
      skip: offset - 1,
      take: 5
    })
  }

  async updateNotice(id: number, noticeDto: RequestNoticeDto): Promise<Notice> {
    const noticeExist = await this.prisma.notice.findUnique({
      where: {
        id: id
      }
    })

    if (!noticeExist) {
      throw new EntityNotExistException('notice')
    }
    if (noticeExist.group_id != noticeDto.group_id) {
      throw new UnprocessableDataException('Group id must not be changed')
    }

    const notice = await this.prisma.notice.update({
      where: {
        id: id
      },
      data: {
        title: noticeDto.title,
        content: noticeDto.content,
        visible: noticeDto.visible,
        fixed: noticeDto.fixed
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
