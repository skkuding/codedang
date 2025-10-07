import { Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CreateCourseNoticeInput,
  UpdateCourseNoticeInput
} from './model/course-notice.input'
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

  /**
   *  한 강의 공지사항에 대해 모든 유저의 읽음 기록을 초기화합니다.
   *
   * @param {number} groupId
   * @param {number} courseNoticeId
   */
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

    await this.prisma.courseNoticeRecord.deleteMany({
      where: {
        userId: {
          in: userIds.reduce((acc: number[], val) => {
            acc.push(val.userId)
            return acc
          }, [])
        },
        courseNoticeId
      }
    })
  }

  /**
   * 공지사항을 1개 만듭니다.
   *
   * @param {number} userId 접근하려는 유저 아이디
   * @param {CreateCourseNoticeInput} createCourseNoticeInput 공지사항 내용 (groupId, title, content, isFixed, isPublic)
   * @returns {CourseNotice}
   */
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

    return courseNotice
  }

  /**
   * 강의 내 공지 1개를 삭제합니다.
   *
   * @param {number} courseNoticeId 강의 공지 아이디
   * @returns {CourseNotice}
   */
  async deleteCourseNotice(courseNoticeId: number) {
    return await this.prisma.courseNotice.delete({
      where: {
        id: courseNoticeId
      }
    })
  }

  /**
   * 강의 내 공지 1개를 수정합니다.
   * (읽음 기록을 초기화합니다.)
   *
   * @param {number} courseNoticeId 강의 공지 아이디
   * @param {UpdateCourseNoticeInput} updateCourseNoticeInput 수정할 공지사항 내용 (title, content, isFixed, isPublic 등 옵셔널)
   * @returns {CourseNotice}
   */
  async updateCourseNotice(
    courseNoticeId: number,
    updateCourseNoticeInput: UpdateCourseNoticeInput
  ) {
    const courseNotice = await this.prisma.courseNotice.findUnique({
      where: {
        id: courseNoticeId
      },
      select: {
        groupId: true
      }
    })

    if (!courseNotice) {
      throw new NotFoundException('CourseNotice')
    }

    await this.markAsUnread(courseNotice.groupId, courseNoticeId)

    return await this.prisma.courseNotice.update({
      where: {
        id: courseNoticeId
      },
      data: updateCourseNoticeInput
    })
  }

  /**
   * 한 강의 내 공지사항 여러 개를 다른 강의로 복제합니다.
   *
   * @param {number} userId 유저 아이디 (복제된 공지의 작성자로 설정됩니다.)
   * @param {number[]} courseNoticeIds 복제할 공지 아이디 목록
   * @param {number} cloneToId 복제해 넣을 강의 아이디
   * @returns {CourseNotice[]}
   */
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
      throw new EntityNotExistException('CourseNotice')
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

    return clones
  }
}
