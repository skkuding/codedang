import {
  Injectable,
  NotAcceptableException,
  NotFoundException
} from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import {
  UnprocessableDataException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'
import { CourseNoticeOrder } from './enum/course_notice-order.enum'

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

  /**
   * 한 유저가 접근할 수 있는 공지 중 읽지 않은 공지의 수를 반환합니다.
   *
   * @param {number} userId 유저 아이디
   */
  async getUnreadCourseNoticeCount({ userId }: { userId: number }) {
    return await this.prisma.courseNoticeRecord.count({
      where: {
        userId,
        isRead: false
      }
    })
  }

  /**
   * 한 유저가 접근할 수 있는 가장 최근 공지를 띄워줍니다.
   *
   * @param {number} userId 유저 아이디
   */
  async getLatestCourseNotice({ userId }: { userId: number }) {
    return await this.prisma.courseNotice.findFirst({
      where: {
        OR: [
          {
            group: {
              userGroup: {
                some: {
                  userId
                }
              }
            }
          },
          {
            isPublic: true
          }
        ]
      },
      select: {
        id: true,
        title: true,
        groupId: true,
        group: {
          select: {
            groupName: true
          }
        },
        updateTime: true,
        CourseNoticeRecord: {
          where: {
            userId
          },
          select: {
            isRead: true
          }
        }
      },
      orderBy: {
        updateTime: 'desc'
      }
    })
  }

  /**
   * 공지사항을 불러올 때 정렬 방식을 지정합니다.
   *
   * @param {CourseNoticeOrder} order 공지 정렬 방식
   * @returns orderBy로 들어가는 객체를 반환합니다.
   */
  getOrderBy(
    order: CourseNoticeOrder
  ): Prisma.CourseNoticeOrderByWithRelationInput {
    switch (order) {
      case CourseNoticeOrder.updateTimeASC:
        return { updateTime: 'asc' }
      case CourseNoticeOrder.updateTimeDESC:
        return { updateTime: 'desc' }
      case CourseNoticeOrder.createTimeASC:
        return { createTime: 'asc' }
      case CourseNoticeOrder.createTimeDESC:
        return { createTime: 'desc' }
    }
  }

  /**
   * 한 강의 내의 공지 목록을 가져옵니다.
   *
   * @param {number} userId 공지 목록을 요청한 유저 아이디
   * @param {number} groupId 공지 목록을 받아오려는 강의 아이디
   * @param {number | null} cursor 가져올 공지의 시작점
   * @param {number} take 가져올 공지의 수
   * @param {string} search 검색어
   * @param {boolean} fixed 고정된 공지를 가져올지 여부
   * @param {CourseNoticeOrder | undefined} order 공지 정렬 순서
   * @returns 특정 강의 내의 공지 사항들에 대한 대략적인 정보를 반환합니다.
   */
  async getCourseNotices({
    userId,
    groupId,
    cursor,
    take,
    search,
    filter,
    fixed = false,
    order
  }: {
    userId: number
    groupId: number
    cursor: number | null
    take: number
    filter: 'all' | 'unread'
    search?: string
    fixed?: boolean
    order?: CourseNoticeOrder
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const courseNotices = await this.prisma.courseNotice.findMany({
      ...paginator,
      where: {
        isFixed: fixed,
        CourseNoticeRecord:
          filter == 'unread'
            ? {
                some: {
                  userId,
                  isRead: false
                }
              }
            : undefined,
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
        updateTime: true,
        isFixed: true,
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
      orderBy: order ? this.getOrderBy(order) : undefined
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
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    return { data, total }
  }

  /**
   * 특정 강의 내의 한 공지에 대해 그 내용과 자세한 정보를 조회합니다.
   *
   * @param {number} userId 조회를 요청한 유저 아이디
   * @param {number} id 강의 공지의 아이디
   * @returns 현재 공지사항의 내용과 이전/이후 공지의 아이디
   */
  async getCourseNoticeByID({ userId, id }: { userId: number; id: number }) {
    const courseNotice = await this.prisma.courseNotice.findUniqueOrThrow({
      where: {
        id
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      }
    })

    const current = {
      ...courseNotice,
      createdBy: courseNotice.createdBy?.username
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
          isPublic: true
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

  /**
   * 공지사항의 읽음 여부를 기록합니다.
   *
   * @param {number} userId 공지를 조회한 유저 아이디
   * @param {number} courseNoticeId 강의 내 공지의 아이디
   * @returns 공지사항 읽음 기록
   */
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

  /**
   * 한 공지사항 내의 댓글 목록을 가져옵니다.
   * 댓글의 개수(take)는 대댓글을 포함한 댓글의 수입니다.
   *
   * @param {number} id 댓글을 조회하려는 강의 공지사항의 아이디
   * @param {number | null} cursor 가져올 댓글의 시작점
   * @param {number} take 가져올 댓글의 수
   * @returns 댓글과 그 댓글에 대한 대댓글을 구분한 리스트를 반환합니다.
   */
  async getCourseNoticeComments({
    id,
    userId,
    userRole,
    cursor,
    take
  }: {
    id: number
    userId: number
    userRole: Role
    cursor: number | null
    take: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const comments = await this.prisma.courseNoticeComment.findMany({
      where: {
        courseNoticeId: id
      },
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
        isDeleted: true,
        isSecret: true,
        replyOnId: true,
        content: true,
        createdTime: true,
        updateTime: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    const myRoleInCourse = await this.prisma.userGroup.findFirst({
      where: {
        userId,
        group: {
          CourseNotice: {
            some: {
              id
            }
          }
        }
      },
      select: {
        isGroupLeader: true
      }
    })

    if (!myRoleInCourse) {
      throw new ForbiddenAccessException('it is not accessable course notice')
    }

    const isVisibleSecretComment =
      userRole != Role.User || myRoleInCourse.isGroupLeader

    type Comment = (typeof comments)[number]
    const commentDatas = comments.reduce(
      (acc, comment) => {
        if (!isVisibleSecretComment && comment.isSecret) {
          comment = {
            ...comment,
            content: '',
            createdBy: {
              username: '',
              studentId: ''
            }
          }
        }
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

    return commentDatas.reverse()
  }

  /**
   * 댓글을 생성합니다.
   *
   * @param {number} userId 댓글을 작성하려는 유저 아이디
   * @param {number} id 댓글을 달려는 강의 공지사항의 아이디
   * @param {CreateCourseNoticeCommentDto} createCourseNoticeCommentDto 댓글의 내용과 대댓글을 달려는 원댓글의 아이디(없으면 대댓글 아님)
   * @returns 생성된 댓글의 정보를 반환합니다.
   * @throws {NotAcceptableException}
   *  - 댓글 내용이 1000자를 넘어갈 때
   *  - 답글에 다시 답글을 달려고 할 때
   */
  async createComment({
    userId,
    id,
    createCourseNoticeCommentDto
  }: {
    userId: number
    id: number
    createCourseNoticeCommentDto: CreateCourseNoticeCommentDto
  }) {
    if (createCourseNoticeCommentDto.content.length > 1000) {
      throw new NotAcceptableException('comment content limit is 1000')
    }

    if (createCourseNoticeCommentDto.replyOnId) {
      const originalComment = await this.prisma.courseNoticeComment.findUnique({
        where: {
          id: createCourseNoticeCommentDto.replyOnId
        },
        select: {
          replyOnId: true
        }
      })

      if (originalComment?.replyOnId) {
        throw new NotAcceptableException('double replies are not allowed.')
      }
    }
    return await this.prisma.courseNoticeComment.create({
      data: {
        createdById: userId,
        courseNoticeId: id,
        ...createCourseNoticeCommentDto
      }
    })
  }

  /**
   * 댓글을 수정합니다
   *
   * @param {number} userId 댓글을 수정하려는 유저 아이디
   * @param {number} id 댓글이 달려있는 강의 공지사항의 아이디
   * @param {number} commentId 수정하려는 댓글 아이디
   * @param {UpdateCourseNoticeCommentDto} updateCourseNoticeCommentDto 수정할 댓글의 내용
   * @returns 수정된 댓글의 내용
   */
  async updateComment({
    userId,
    id,
    commentId,
    updateCourseNoticeCommentDto
  }: {
    userId: number
    id: number
    commentId: number
    updateCourseNoticeCommentDto: UpdateCourseNoticeCommentDto
  }) {
    return await this.prisma.courseNoticeComment.update({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      },
      data: {
        content: updateCourseNoticeCommentDto.content
      }
    })
  }

  /**
   * 댓글을 삭제합니다.
   *
   * @param {number} userId 댓글을 삭제하려는 유저 아이디
   * @param {number} id 댓글이 달려있는 강의 공지사항의 아이디
   * @param {number} commentId 삭제하려는 댓글의 아이디
   * @returns
   * @throws {NotFoundException}
   * - 댓글 아이디, 강의 아이디, 유저 아이디가 일치하는 댓글이 없을 때
   */
  async deleteComment({
    userId,
    id,
    commentId
  }: {
    userId: number
    id: number
    commentId: number
  }) {
    const comment = await this.prisma.courseNoticeComment.findUnique({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      },
      select: {
        replyOn: {
          select: {
            id: true,
            isDeleted: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: {
              select: {
                CourseNoticeComment: true
              }
            }
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      }
    })

    if (!comment) {
      // comment가 존재하지 않을 때
      throw new NotFoundException('CourseNoticeComment')
    }

    if (comment._count.CourseNoticeComment > 0) {
      // 답글이 존재할 때
      return await this.prisma.courseNoticeComment.update({
        where: {
          id: commentId,
          courseNoticeId: id,
          createdById: userId
        },
        data: {
          isDeleted: true,
          content: 'This is a deleted comment.',
          createdById: null
        }
      })
    }

    if (comment.replyOn != null) {
      if (
        comment.replyOn._count.CourseNoticeComment == 1 &&
        comment.replyOn.isDeleted
      ) {
        // 해당 댓글이 답글이고, 원댓글에 대한 답글이 1개 뿐이며 그 원댓글도 삭제되었을 때 (Cascade로 함께 삭제)
        return await this.prisma.courseNoticeComment.delete({
          where: {
            id: comment.replyOn.id
          }
        })
      }
    }

    // 어떤 경우에도 해당하지 않을 때 (답글이 존재하지 않거나 원댓글이 삭제된 마지막 답글이 아닐 때)
    return await this.prisma.courseNoticeComment.delete({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      }
    })
  }
}
