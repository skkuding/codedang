import { Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CloneCourseNoticeInput,
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
    await this.markAsUnread(updateCourseNoticeInput.groupId, courseNoticeId)

    return await this.prisma.courseNotice.update({
      where: {
        id: courseNoticeId
      },
      data: updateCourseNoticeInput
    })
  }

  async cloneCourseNotice(
    userId: number,
    courseNoticeId: number,
    cloneCourseNoticeInput: CloneCourseNoticeInput,
    cloneToId: number
  ) {
    const original = await this.prisma.courseNotice.findUnique({
      where: {
        id: courseNoticeId
      },
      select: {
        title: true,
        content: true,
        isFixed: true,
        isVisible: true,
        problemId: true
      }
    })

    if (!original) {
      throw new NotFoundException('original notice not found')
    }

    if (
      cloneCourseNoticeInput.excludeProblem &&
      cloneCourseNoticeInput.problemId
    ) {
      throw new UnprocessableDataException(
        'problemId and excludeProblem are incompatible.'
      )
    }

    const clone = await this.prisma.courseNotice.create({
      data: {
        createdById: userId,
        groupId: cloneToId,
        problemId: cloneCourseNoticeInput.excludeProblem
          ? null
          : original.problemId,
        title: cloneCourseNoticeInput.title ?? original.title,
        content: cloneCourseNoticeInput.content ?? original.content,
        isFixed: cloneCourseNoticeInput.isFixed ?? original.isFixed,
        isVisible: cloneCourseNoticeInput.isVisible ?? original.isVisible
      }
    })

    await this.markAsUnread(cloneToId, clone.id)

    return clone
  }
}
