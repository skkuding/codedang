import { UserNoticePage } from './notice.interface'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Notice } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { RequestNoticeDto } from './dto/request-notice.dto'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(group_id: number, offset: number): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        group_id: group_id,
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

  async findOne(id: number, group_id: number): Promise<UserNoticePage> {
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
      rejectOnNotFound: true
    })
    const notice = { current: current }

    notice['prev'] = await this.prisma.notice.findFirst({
      where: {
        id: {
          lt: id
        },
        group_id: group_id,
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
        group_id: group_id,
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

  async updateNotice(
    id: number,
    noticeData: RequestNoticeDto
  ): Promise<Notice> {
    //TODO: user authentication
    const noticeExist = await this.prisma.notice.findUnique({
      where: {
        id: id
      }
    })
    if (!noticeExist) {
      throw new HttpException(
        'The notice does not exist',
        HttpStatus.BAD_REQUEST
      )
    }
    if (noticeExist.group_id != noticeData.group_id) {
      throw new HttpException(
        'Group id must not be changed',
        HttpStatus.BAD_REQUEST
      )
    }

    const notice = await this.prisma.notice.update({
      where: {
        id: id
      },
      data: {
        title: noticeData.title,
        content: noticeData.content,
        visible: noticeData.visible,
        fixed: noticeData.fixed
      }
    })

    return notice
  }

  async findOwn(id: number, offset: number): Promise<Partial<Notice>[]> {
    return await this.prisma.notice.findMany({
      where: {
        created_by_id: id
      },
      select: {
        id: true,
        group: true,
        title: true,
        create_time: true,
        visible: true
      },
      skip: offset - 1,
      take: 5
    })
  }

  async findDetail(id: number): Promise<Partial<Notice>> {
    return await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      select: {
        group: {
          select: {
            id: true,
            group_name: true
          }
        },
        title: true,
        content: true,
        visible: true,
        fixed: true
      },
      rejectOnNotFound: true
    })
  }

  async delete(id: number): Promise<{ success: boolean }> {
    await this.prisma.notice.findUnique({
      where: {
        id: id
      },
      rejectOnNotFound: true
    })

    await this.prisma.notice.delete({
      where: {
        id: id
      }
    })
    return { success: true }
  }

  async createNotice(
    userId: number,
    noticeData: RequestNoticeDto
  ): Promise<Notice> {
    //TODO: user authentication

    const group = await this.prisma.group.findUnique({
      where: {
        id: noticeData.group_id
      }
    })
    if (!group) {
      throw new HttpException(
        'The group does not exist',
        HttpStatus.BAD_REQUEST
      )
    }

    const notice = await this.prisma.notice.create({
      data: {
        title: noticeData.title,
        content: noticeData.content,
        visible: noticeData.visible,
        fixed: noticeData.fixed,
        group: {
          connect: { id: noticeData.group_id }
        },
        created_by: {
          connect: { id: userId }
        }
      }
    })

    return notice
  }
}
