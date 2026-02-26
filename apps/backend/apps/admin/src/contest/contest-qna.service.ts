import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class ContestQnAService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 대회의 QnA 목록 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} userId 사용자 ID (관리자)
   * @param {number} take 가져올 QnA 개수
   * @param {number | null} cursor 페이지네이션 커서
   * @param {object} [filter] 필터 옵션
   * @returns QnA 배열
   */
  async getContestQnAs(
    contestId: number,
    userId: number,
    take: number,
    cursor: number | null,
    filter?: {
      isResolved?: boolean
    }
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { id: true }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const paginator = this.prisma.getPaginator(cursor)

    const where: Prisma.ContestQnAWhereInput = {
      contestId,
      ...(filter?.isResolved !== undefined && { isResolved: filter.isResolved })
    }

    const qnas = await this.prisma.contestQnA.findMany({
      ...paginator,
      take,
      where,
      orderBy: {
        id: 'desc'
      },
      include: {
        createdBy: {
          select: {
            username: true
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    return qnas.map(({ readBy, ...rest }) => ({
      ...rest,
      isRead: readBy.includes(userId)
    }))
  }

  /**
   * 특정 대회의 QnA 상세 정보를 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} userId 사용자 ID
   * @param {number} order 조회할 QnA의 order
   * @returns QnA 상세 정보
   */
  async getContestQnA(contestId: number, userId: number, order: number) {
    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      },
      include: {
        createdBy: {
          select: {
            username: true
          }
        },
        comments: {
          include: {
            createdBy: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })
    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const isRead = contestQnA.readBy.includes(userId)
    if (!isRead) {
      await this.prisma.contestQnA.update({
        where: { id: contestQnA.id },
        data: {
          readBy: {
            push: userId
          }
        }
      })
    }

    return contestQnA
  }

  /**
   * 특정 대회의 QnA를 삭제합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} order QnA의 order
   * @returns 삭제된 QnA 정보
   */
  async deleteContestQnA(contestId: number, order: number) {
    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      }
    })
    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    return await this.prisma.contestQnA.delete({
      where: { id: contestQnA.id }
    })
  }

  /**
   * QnA에 스태프 댓글을 작성합니다.
   * 해당 QnA는 자동으로 'isResolved: true' 상태가 됩니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} userId 사용자 ID (관리자)
   * @param {number} order QnA의 order
   * @param {string} content 댓글 내용
   * @returns 생성된 댓글
   */
  async createContestQnAComment(
    contestId: number,
    userId: number,
    order: number,
    content: string
  ) {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Content cannot be empty')
    }

    const [contest, contestQnA] = await Promise.all([
      this.prisma.contest.findUnique({
        where: { id: contestId },
        select: { id: true }
      }),
      this.prisma.contestQnA.findFirst({
        where: {
          contestId,
          order
        },
        select: {
          id: true,
          isResolved: true
        }
      })
    ])

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.contestQnAComment.aggregate({
        where: { contestQnAId: contestQnA.id },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const commentOrder = (maxOrder._max?.order ?? 0) + 1
      const comment = await tx.contestQnAComment.create({
        data: {
          content,
          contestQnAId: contestQnA.id,
          createdById: userId,
          isContestStaff: true,
          order: commentOrder
        }
      })

      if (!contestQnA.isResolved) {
        await tx.contestQnA.update({
          where: { id: contestQnA.id },
          data: { isResolved: true, readBy: { set: [userId] } }
        })
      }

      return comment
    })
  }

  /**
   * QnA의 댓글을 삭제합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} qnAOrder QnA의 order
   * @param {number} commentOrder 댓글의 order
   * @returns 삭제된 댓글
   */
  async deleteContestQnAComment(
    contestId: number,
    qnAOrder: number,
    commentOrder: number
  ) {
    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order: qnAOrder
      }
    })
    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const contestQnAComment = await this.prisma.contestQnAComment.findFirst({
      where: {
        contestQnAId: contestQnA.id,
        order: commentOrder
      }
    })
    if (!contestQnAComment) {
      throw new EntityNotExistException('ContestQnAComment')
    }

    return await this.prisma.$transaction(async (tx) => {
      const deletedComment = await tx.contestQnAComment.delete({
        where: { id: contestQnAComment.id }
      })

      const lastComment = await tx.contestQnAComment.findFirst({
        where: {
          contestQnAId: contestQnA.id
        },
        orderBy: {
          order: 'desc'
        },
        select: {
          isContestStaff: true
        }
      })

      const isResolved = lastComment ? lastComment.isContestStaff : false

      await tx.contestQnA.update({
        where: { id: contestQnA.id },
        data: { isResolved }
      })

      return deletedComment
    })
  }

  /**
   * QnA의 'isResolved' 상태를 변경합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} qnAOrder QnA의 order
   * @returns QnA
   */
  async toggleContestQnAResolved(contestId: number, qnAOrder: number) {
    const contestQnA = await this.prisma.contestQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_order: { contestId, order: qnAOrder }
      }
    })
    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const commentCount = await this.prisma.contestQnAComment.count({
      where: {
        contestQnAId: contestQnA.id
      }
    })
    if (commentCount === 0) {
      throw new BadRequestException('ContestQnA has no comments')
    }

    // 해결완료 상태 토글 (동시성 고려하여 트랜잭션 사용)
    const updatedContestQnA = await this.prisma.$transaction(async (tx) => {
      const currentQnA = await tx.contestQnA.findUnique({
        where: { id: contestQnA.id },
        select: { isResolved: true }
      })

      return await tx.contestQnA.update({
        where: { id: contestQnA.id },
        data: {
          isResolved: !currentQnA!.isResolved
        }
      })
    })

    return updatedContestQnA
  }
}
