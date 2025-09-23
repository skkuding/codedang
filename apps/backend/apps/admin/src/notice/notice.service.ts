import { Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '@libs/prisma'
import type {
  CreateCourseNoticeInput,
  UpdateCourseNoticeInput
} from './model/course_notice.input'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createNotice(userId: number, createNoticeInput: CreateNoticeInput) {
    const noticeCreated = await this.prisma.notice.create({
      data: {
        createdById: userId,
        ...createNoticeInput
      }
    })
    this.eventEmitter.emit('notice.created', {
      noticeId: noticeCreated.id
    })

    return noticeCreated
  }

  async deleteNotice(noticeId: number) {
    return await this.prisma.notice.delete({
      where: {
        id: noticeId
      }
    })
  }

  async updateNotice(noticeId: number, updateNoticeInput: UpdateNoticeInput) {
    return await this.prisma.notice.update({
      where: {
        id: noticeId
      },
      data: updateNoticeInput
    })
  }

  async getNotice(noticeId: number) {
    return await this.prisma.notice.findUniqueOrThrow({
      where: {
        id: noticeId
      }
    })
  }

  async getNotices(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)
    return await this.prisma.notice.findMany({
      ...paginator,
      take
    })
  }
}

@Injectable()
export class CourseNoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async markAsUnread(groupId: number, courseNoticeId: number) {
    const userIds = await this.prisma.userGroup.findMany({
      where: {
        groupId
      },
      select: {
        userId: true
      }
    })

    if (userIds.length == 0) {
      throw new NotFoundException('course user is not found')
    }

    const setRecord = userIds.map(async (userId) => {
      return await this.prisma.courseNoticeRecord.upsert({
        where: {
          courseNoticeIdUserIdUnique: {
            courseNoticeId,
            userId: userId.userId
          }
        },
        create: {
          courseNoticeId,
          userId: userId.userId
        },
        update: {
          isRead: false
        }
      })
    })

    await Promise.all(setRecord)
  }

  async createCourseNotice(
    userId: number,
    createCourseNoticeInput: CreateCourseNoticeInput
  ) {
    const courseNotice = await this.prisma.courseNotice.create({
      data: {
        createdById: userId,
        ...createCourseNoticeInput
      }
    })

    await this.markAsUnread(createCourseNoticeInput.groupId, courseNotice.id)

    return courseNotice
  }

  async deleteCourseNotice(courseNoticeId: number) {
    return await this.prisma.courseNotice.delete({
      where: {
        id: courseNoticeId
      }
    })
  }

  async updateCourseNotice(
    courseNoticeId: number,
    updateCourseNoticeInput: UpdateCourseNoticeInput
  ) {
    const groupId = await this.prisma.courseNotice.findUniqueOrThrow({
      where: {
        id: courseNoticeId
      },
      select: {
        groupId: true
      }
    })

    await this.markAsUnread(groupId.groupId, courseNoticeId)

    return await this.prisma.courseNotice.update({
      where: {
        id: courseNoticeId
      },
      data: updateCourseNoticeInput
    })
  }

  async cloneCourseNotice(
    userId: number,
    courseNoticeIds: number[],
    cloneToId: number
  ) {
    const originals = await this.prisma.courseNotice.findMany({
      where: {
        id: {
          in: courseNoticeIds
        }
      },
      select: {
        title: true,
        content: true,
        isFixed: true,
        isPublic: true
      }
    })

    if (originals.length == 0) {
      throw new NotFoundException('original notice not found')
    }

    const clones = await this.prisma.courseNotice.createManyAndReturn({
      data: originals.map((original) => {
        return {
          createdById: userId,
          groupId: cloneToId,
          title: original.title,
          content: original.content,
          isFixed: original.isFixed,
          isPublic: original.isPublic
        }
      })
    })

    await Promise.all(
      clones.map((clone) => this.markAsUnread(cloneToId, clone.id))
    )

    return clones
  }
}
