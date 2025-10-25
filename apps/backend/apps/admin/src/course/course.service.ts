import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateCourseQnAInput } from './model/course-qna.input'

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseQnAs(groupId: number) {
    return await this.prisma.courseQnA.findMany({
      where: { groupId },
      include: { createdBy: { select: { username: true } } },
      orderBy: { order: 'asc' }
    })
  }

  async getCourseQnA(groupId: number, order: number) {
    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: { groupId, order }
      },
      include: {
        createdBy: { select: { username: true } },
        comments: {
          include: { createdBy: { select: { username: true } } },
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }
    return qna
  }

  async updateCourseQnA(groupId: number, input: UpdateCourseQnAInput) {
    const { order, ...data } = input
    const qna = await this.getCourseQnA(groupId, order)

    return await this.prisma.courseQnA.update({
      where: { id: qna.id },
      data
    })
  }

  async deleteCourseQnA(groupId: number, order: number) {
    const qna = await this.getCourseQnA(groupId, order)
    return await this.prisma.courseQnA.delete({
      where: { id: qna.id }
    })
  }

  async createCourseQnAComment(
    userId: number,
    groupId: number,
    order: number,
    content: string
  ) {
    const qna = await this.getCourseQnA(groupId, order)

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
          isCourseStaff: true, // Admin API에서는 항상 true
          order: newOrder
        }
      })

      await tx.courseQnA.update({
        where: { id: qna.id },
        data: {
          isResolved: true,
          readBy: { set: [userId] }
        }
      })
      return comment
    })
  }

  async deleteCourseQnAComment(
    groupId: number,
    qnaOrder: number,
    commentOrder: number
  ) {
    const qna = await this.getCourseQnA(groupId, qnaOrder)
    const comment = await this.prisma.courseQnAComment.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        courseQnAId_order: { courseQnAId: qna.id, order: commentOrder }
      }
    })

    if (!comment) {
      throw new EntityNotExistException('CourseQnAComment')
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

      await tx.courseQnA.update({
        where: { id: qna.id },
        data: { isResolved: lastComment ? lastComment.isCourseStaff : false }
      })

      return deletedComment
    })
  }
}
