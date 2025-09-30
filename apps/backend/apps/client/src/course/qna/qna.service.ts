// apps/backend/apps/client/src/course/qna/qna.service.ts
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

  /**
   * @description Course Q&A를 생성합니다.
   * @param userId 작성자 ID
   * @param courseId Course의 group ID
   * @param data Q&A 생성에 필요한 데이터
   * @param problemId 연결할 문제 ID (선택 사항)
   * @returns 생성된 CourseQnA
   * @throws {EntityNotExistException} Course 또는 Problem이 존재하지 않을 때
   * @throws {ForbiddenAccessException} Course의 멤버가 아닐 때
   */
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

  /**
   * @description Course Q&A 목록을 필터링하여 조회합니다.
   * @param userId 현재 요청을 보낸 사용자 ID
   * @param courseId Course의 group ID
   * @param filter 필터링 조건
   * @returns 필터링된 CourseQnA 목록 (isRead 필드 포함)
   * @throws {EntityNotExistException} Course가 존재하지 않을 때
   */
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

    // 비밀글 접근 제어
    if (!isCourseStaff) {
      baseWhere.OR = [
        { isPrivate: false },
        ...(userId ? [{ createdById: userId }] : [])
      ]
    }

    // 기획서 필터링 로직
    if (filter.isAnswered !== undefined) {
      baseWhere.isResolved = filter.isAnswered
    }

    // 카테고리 및 문제 필터링 로직
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

  /**
   * @description 특정 Course Q&A를 상세 조회합니다.
   * @param userId 현재 요청을 보낸 사용자 ID
   * @param courseId Course의 group ID
   * @param order 조회할 Q&A의 order 번호
   * @returns Q&A 상세 정보 (댓글 포함)
   * @throws {EntityNotExistException} Course 또는 QnA가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 비밀글에 접근 권한이 없을 때
   */
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
      throw new EntityNotExistException('CourseQnA')
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

  /**
   * @description Course Q&A를 삭제합니다.
   * @param userId 현재 요청을 보낸 사용자 ID
   * @param courseId Course의 group ID
   * @param order 삭제할 Q&A의 order 번호
   * @returns 삭제된 CourseQnA
   * @throws {EntityNotExistException} Course 또는 QnA가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 삭제 권한이 없을 때
   */
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
      throw new EntityNotExistException('CourseQnA')
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

  /**
   * @description Course Q&A에 댓글을 생성합니다.
   * @param userId 댓글 작성자 ID
   * @param courseId Course의 group ID
   * @param order 댓글을 작성할 Q&A의 order 번호
   * @param content 댓글 내용
   * @returns 생성된 CourseQnAComment
   * @throws {EntityNotExistException} Course 또는 QnA가 존재하지 않을 때
   */
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
      throw new EntityNotExistException('CourseQnA')
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

  /**
   * @description Course Q&A의 댓글을 삭제합니다.
   * @param userId 현재 요청을 보낸 사용자 ID
   * @param courseId Course의 group ID
   * @param qnaOrder 댓글이 속한 Q&A의 order 번호
   * @param commentOrder 삭제할 댓글의 order 번호
   * @returns 삭제된 CourseQnAComment
   * @throws {EntityNotExistException} Course, QnA, 또는 Comment가 존재하지 않을 때
   * @throws {ForbiddenAccessException} 삭제 권한이 없을 때
   */
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
      throw new EntityNotExistException('CourseQnA')
    }

    const comment = await this.prisma.courseQnAComment.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        courseQnAId_order: { courseQnAId: qna.id, order: commentOrder }
      }
    })
    if (!comment) {
      throw new EntityNotExistException('CourseQnAComment')
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
