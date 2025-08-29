import { Injectable } from '@nestjs/common'
import {
  UnprocessableDataException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices({
    cursor,
    take,
    search,
    fixed = false
  }: {
    cursor: number | null
    take: number
    search?: string
    fixed?: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const notices = await this.prisma.notice.findMany({
      ...paginator,
      where: {
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

  async getNoticeByID(id: number) {
    const notice = await this.prisma.notice.findUniqueOrThrow({
      where: {
        id,
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

@Injectable()
export class CourseNoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices({
    userId,
    groupId,
    cursor,
    take,
    search,
    fixed = false
  }: {
    userId: number
    groupId: number
    cursor: number | null
    take: number
    search?: string
    fixed?: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const courseNotices = await this.prisma.courseNotice.findMany({
      ...paginator,
      where: {
        isVisible: true,
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        },
        groupId
      },
      take,
      select: {
        id: true,
        title: true,
        createTime: true,
        isFixed: true,
        problem: {
          select: {
            id: true,
            title: true
          }
        },
        createdBy: {
          select: {
            username: true
          }
        },
        CourseNoticeRecord: {
          where: {
            userId
          },
          select: {
            isRead: true
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    const data = courseNotices.map((courseNotice) => {
      if (courseNotice.CourseNoticeRecord.length !== 1) {
        throw new UnprocessableDataException(
          'invalid notice read record has found'
        )
      }

      const { CourseNoticeRecord, _count, ...notice } = {
        ...courseNotice,
        commentCount: courseNotice._count.CourseNoticeComment,
        isRead: courseNotice.CourseNoticeRecord[0].isRead,
        createdBy: courseNotice.createdBy?.username
      }

      return notice
    })

    const total = await this.prisma.courseNotice.count({
      where: {
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

  async getNoticeByID({
    userId,
    id,
    cursor,
    take
  }: {
    userId: number
    id: number
    cursor: number | null
    take: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const courseNotice = await this.prisma.courseNotice.findUniqueOrThrow({
      where: {
        id,
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
        },
        CourseNoticeComment: {
          ...paginator,
          take,
          select: {
            id: true,
            createdBy: {
              select: {
                username: true,
                studentId: true
              }
            },
            replyOnId: true,
            content: true,
            createdTime: true,
            updateTime: true
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    })

    type Comment = (typeof courseNotice.CourseNoticeComment)[number]
    const commentDatas = courseNotice.CourseNoticeComment.reduce(
      (acc, comment) => {
        if (!comment.replyOnId) {
          acc.push({
            comment,
            replys: []
          })
        } else {
          const nestedOnId = acc.findIndex(
            (data) => data.comment.id === comment.replyOnId
          )
          if (nestedOnId === -1) {
            throw new UnprocessableDataException('CourseNoticeComment')
          }
          acc[nestedOnId].replys.push(comment)
        }
        return acc
      },
      [] as {
        comment: Comment
        replys: Comment[]
      }[]
    )

    const current = {
      ...courseNotice,
      createdBy: courseNotice.createdBy?.username,
      CourseNoticeComment: commentDatas.reverse()
    }

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare,
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

    await this.markAsRead({
      userId,
      courseNoticeId: id
    })

    return {
      current,
      prev: await this.prisma.courseNotice.findFirst(navigate('prev')),
      next: await this.prisma.courseNotice.findFirst(navigate('next'))
    }
  }

  async markAsRead({
    userId,
    courseNoticeId
  }: {
    userId: number
    courseNoticeId: number
  }) {
    try {
      const updated = await this.prisma.courseNoticeRecord.update({
        where: {
          courseNoticeIdUserIdUnique: {
            courseNoticeId,
            userId
          }
        },
        data: {
          isRead: true
        }
      })

      return updated
    } catch {
      throw new EntityNotExistException('CourseNoticeRecord')
    }
  }

  async createComment({
    userId,
    createCourseNoticeCommentDto
  }: {
    userId: number
    createCourseNoticeCommentDto: CreateCourseNoticeCommentDto
  }) {
    return await this.prisma.courseNoticeComment.create({
      data: {
        createdById: userId,
        ...createCourseNoticeCommentDto
      }
    })
  }

  async updateComment({
    userId,
    updateCourseNoticeCommentDto
  }: {
    userId: number
    updateCourseNoticeCommentDto: UpdateCourseNoticeCommentDto
  }) {
    return await this.prisma.courseNoticeComment.update({
      where: {
        id: updateCourseNoticeCommentDto.commentId,
        createdById: userId
      },
      data: {
        content: updateCourseNoticeCommentDto.content
      }
    })
  }

  async deleteComment({
    userId,
    commentId
  }: {
    userId: number
    commentId: number
  }) {
    return await this.prisma.courseNoticeComment.delete({
      where: {
        id: commentId,
        createdById: userId
      }
    })
  }
}
