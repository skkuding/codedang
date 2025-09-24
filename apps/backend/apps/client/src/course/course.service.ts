import { Injectable } from '@nestjs/common'
import { CourseQnACategory, type Prisma } from '@prisma/client'
import {
  ForbiddenAccessException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateCourseQnADto, GetCourseQnAsFilterDto } from './dto/qna.dto'

@Injectable()
export class QnaService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourseQnA(
    userId: number,
    courseId: number, // this is actually groupId from the URL
    data: CreateCourseQnADto,
    problemId?: number
  ) {
    const groupId = courseId

    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const membership = await this.prisma.userGroup.findFirst({
      where: { userId, groupId: group.id }
    })
    if (!membership) {
      throw new ForbiddenAccessException('Not a member of this course')
    }

    const createInput: Prisma.CourseQnACreateInput = {
      ...data,
      createdBy: { connect: { id: userId } },
      group: { connect: { id: group.id } },
      order: 0, // Placeholder, will be replaced in transaction
      category: CourseQnACategory.General,
      readBy: [userId]
    }

    if (problemId) {
      const problem = await this.prisma.problem.findUnique({
        where: { id: problemId }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }
      createInput.category = CourseQnACategory.Problem
      createInput.problem = { connect: { id: problemId } }
    }

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.courseQnA.aggregate({
        where: { groupId: group.id },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const order = (maxOrder._max?.order ?? 0) + 1
      createInput.order = order

      return await tx.courseQnA.create({
        data: createInput
      })
    })
  }

  async getCourseQnAs(
    userId: number | null,
    courseId: number, // this is actually groupId
    filter: GetCourseQnAsFilterDto
  ) {
    const groupId = courseId
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const isCourseStaff = userId
      ? (await this.prisma.userGroup.findFirst({
          where: { userId, groupId, isGroupLeader: true }
        })) !== null
      : false

    const baseWhere: Prisma.CourseQnAWhereInput = {
      groupId
    }

    if (!isCourseStaff) {
      baseWhere.OR = [
        { isPrivate: false },
        ...(userId ? [{ createdById: userId }] : [])
      ]
    }

    if (filter.isAnswered !== undefined) {
      baseWhere.isResolved = filter.isAnswered
    }

    const orConds: Prisma.CourseQnAWhereInput[] = []
    const categories = filter.categories ?? []
    const includeProblem = categories.includes(CourseQnACategory.Problem)
    const general = categories.filter((c) => c !== CourseQnACategory.Problem)

    if (includeProblem) {
      if (filter.problemIds?.length) {
        orConds.push({
          category: CourseQnACategory.Problem,
          problemId: { in: filter.problemIds }
        })
      } else {
        orConds.push({ category: CourseQnACategory.Problem })
      }
    }
    if (general.length) {
      orConds.push({ category: { in: general } })
    }

    const where: Prisma.CourseQnAWhereInput = orConds.length
      ? { AND: [baseWhere, { OR: orConds }] }
      : baseWhere

    if (filter.search) {
      where.title = { contains: filter.search, mode: 'insensitive' }
    }

    const qnas = await this.prisma.courseQnA.findMany({
      select: {
        id: true,
        order: true,
        title: true,
        content: true,
        isPrivate: true,
        isResolved: true,
        category: true,
        problemId: true,
        createTime: true,
        readBy: true,
        createdBy: { select: { username: true } },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { select: { comments: true } }
      },
      where,
      orderBy: {
        order: 'asc'
      }
    })

    return qnas.map(({ readBy, ...rest }) => ({
      ...rest,
      isRead: userId == null || readBy.includes(userId)
    }))
  }

  async getCourseQnA(userId: number | null, courseId: number, order: number) {
    const groupId = courseId
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: {
          groupId,
          order
        }
      },
      include: {
        comments: {
          include: { createdBy: { select: { username: true } } },
          orderBy: { order: 'asc' }
        },
        createdBy: { select: { username: true } }
      }
    })

    if (!qna) {
      throw new EntityNotExistException('QnA')
    }

    if (qna.isPrivate) {
      const isCourseStaff = userId
        ? (await this.prisma.userGroup.findFirst({
            where: { userId, groupId, isGroupLeader: true }
          })) !== null
        : false

      if (!isCourseStaff && qna.createdById !== userId) {
        throw new ForbiddenAccessException('This is a private question')
      }
    }

    if (userId != null && !qna.readBy.includes(userId)) {
      await this.prisma.courseQnA.update({
        where: { id: qna.id },
        data: {
          readBy: {
            push: userId
          }
        }
      })
    }
    return qna
  }

  async deleteCourseQnA(userId: number, courseId: number, order: number) {
    const groupId = courseId
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: { groupId, order }
      }
    })

    if (!qna) {
      throw new EntityNotExistException('QnA')
    }

    const isCourseStaff =
      (await this.prisma.userGroup.findFirst({
        where: { userId, groupId, isGroupLeader: true }
      })) !== null

    if (qna.createdById !== userId && !isCourseStaff) {
      throw new ForbiddenAccessException('You are not allowed to delete')
    }

    return await this.prisma.courseQnA.delete({ where: { id: qna.id } })
  }

  async createCourseQnAComment(
    userId: number,
    courseId: number,
    order: number,
    content: string
  ) {
    const groupId = courseId
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: { groupId, order }
      }
    })
    if (!qna) {
      throw new EntityNotExistException('QnA')
    }

    const isCourseStaff =
      (await this.prisma.userGroup.findFirst({
        where: { userId, groupId, isGroupLeader: true }
      })) !== null

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.courseQnAComment.aggregate({
        where: { courseQnAId: qna.id },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const newOrder = (maxOrder._max?.order ?? 0) + 1

      const comment = await tx.courseQnAComment.create({
        data: {
          content,
          courseQnAId: qna.id,
          createdById: userId,
          isCourseStaff,
          order: newOrder
        }
      })

      await tx.courseQnA.update({
        where: { id: qna.id },
        data: {
          isResolved: isCourseStaff,
          readBy: { set: [userId] } // Reset readBy
        }
      })

      return comment
    })
  }

  async deleteCourseQnAComment(
    userId: number,
    courseId: number,
    qnaOrder: number,
    commentOrder: number
  ) {
    const groupId = courseId
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, courseInfo: { isNot: null } }
    })
    if (!group) {
      throw new EntityNotExistException('Course')
    }

    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: { groupId, order: qnaOrder }
      }
    })
    if (!qna) {
      throw new EntityNotExistException('QnA')
    }

    const comment = await this.prisma.courseQnAComment.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        courseQnAId_order: { courseQnAId: qna.id, order: commentOrder }
      }
    })
    if (!comment) {
      throw new EntityNotExistException('Comment')
    }

    const isCourseStaff =
      (await this.prisma.userGroup.findFirst({
        where: { userId, groupId, isGroupLeader: true }
      })) !== null

    if (comment.createdById !== userId && !isCourseStaff) {
      throw new ForbiddenAccessException('You are not allowed to delete')
    }

    return await this.prisma.$transaction(async (tx) => {
      const deletedComment = await tx.courseQnAComment.delete({
        where: { id: comment.id }
      })

      const lastComment = await tx.courseQnAComment.findFirst({
        where: { courseQnAId: qna.id },
        orderBy: { order: 'desc' },
        select: { isCourseStaff: true }
      })

      const isResolved = lastComment ? lastComment.isCourseStaff : false
      await tx.courseQnA.update({
        where: { id: qna.id },
        data: { isResolved }
      })

      return deletedComment
    })
  }
}
