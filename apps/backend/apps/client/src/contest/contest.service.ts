import { Injectable } from '@nestjs/common'
import { ContestRole, Prisma, QnACategory, type Contest } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  ContestQnACreateDto,
  GetContestQnAsFilter
} from './dto/contest-qna.dto'

const contestSelectOption = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  registerDueTime: true,
  freezeTime: true,
  invitationCode: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  posterUrl: true,
  summary: true,
  contestRecord: {
    select: {
      userId: true
    }
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    select: {
      contestRecord: true
    }
  }
} satisfies Prisma.ContestSelect

export type ContestSelectResult = Prisma.ContestGetPayload<{
  select: typeof contestSelectOption
}>

export type ContestResult = Omit<ContestSelectResult, '_count'> & {
  participants: number
}

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async getContests(userId?: number, search?: string) {
    // 1. get all contests
    const now = new Date()

    const searchFilter = search
      ? { title: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {}

    const ongoingContests = await this.prisma.contest.findMany({
      where: {
        startTime: {
          lte: now
        },
        endTime: {
          gt: now
        },
        ...searchFilter
      },
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }],
      select: contestSelectOption
    })

    const upcomingContests = await this.prisma.contest.findMany({
      where: {
        startTime: {
          gt: now
        },
        ...searchFilter
      },
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }],
      select: contestSelectOption
    })

    const finishedContests = await this.prisma.contest.findMany({
      where: {
        endTime: {
          lte: now
        },
        ...searchFilter
      },
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }],
      select: contestSelectOption
    })

    const checkIsRegisteredAndRenameParticipants = (
      contest: ContestSelectResult
    ) => {
      const { _count: countObject, contestRecord, ...rest } = contest

      if (!userId) {
        return {
          ...rest,
          participants: countObject.contestRecord,
          isRegistered: false
        }
      }

      return {
        ...rest,
        participants: countObject.contestRecord,
        isRegistered: contestRecord.some((record) => record.userId === userId)
      }
    }

    const ongoingContestsWithIsRegistered = ongoingContests.map(
      checkIsRegisteredAndRenameParticipants
    )
    const upcomingContestsWithIsRegistered = upcomingContests.map(
      checkIsRegisteredAndRenameParticipants
    )
    const finishedContestsWithIsRegistered = finishedContests.map(
      checkIsRegisteredAndRenameParticipants
    )

    return {
      ongoing: ongoingContestsWithIsRegistered,
      upcoming: upcomingContestsWithIsRegistered,
      finished: finishedContestsWithIsRegistered
    }
  }

  async getBannerContests() {
    const fastestUpcomingContestId = (
      await this.prisma.contest.findFirstOrThrow({
        where: {
          startTime: {
            gte: new Date()
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        select: {
          id: true
        }
      })
    ).id
    const mostRegisteredId = (
      await this.prisma.contest.findFirstOrThrow({
        where: {
          startTime: {
            gte: new Date()
          }
        },
        orderBy: {
          contestRecord: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: 'desc'
          }
        },
        select: {
          id: true
        }
      })
    ).id

    return {
      fastestUpcomingContestId,
      mostRegisteredId
    }
  }

  async getContest(id: number, userId?: number | null) {
    // check if the user has already registered this contest
    // initial value is false
    let isRegistered = false
    // check if the user has contest role in this contest
    let isPrivilegedRole = false
    let contest: Partial<Contest>
    if (userId) {
      const hasRegistered = await this.prisma.contestRecord.findFirst({
        where: { userId, contestId: id }
      })
      if (hasRegistered) {
        isRegistered = true
      }
      const hasPrivilegedRole = await this.prisma.userContest.findFirst({
        where: {
          userId,
          contestId: id,
          role: {
            in: ['Admin', 'Manager', 'Reviewer']
          }
        }
      })
      if (hasPrivilegedRole) {
        isPrivilegedRole = true
      }
    }
    try {
      contest = await this.prisma.contest.findUniqueOrThrow({
        where: {
          id
        },
        select: {
          ...contestSelectOption,
          description: true
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Contest')
      }
      throw error
    }

    const { invitationCode, ...contestDetails } = contest
    const invitationCodeExists = invitationCode != null

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare
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
      ...contestDetails,
      invitationCodeExists,
      isRegistered,
      isPrivilegedRole,
      prev: await this.prisma.contest.findFirst(navigate('prev')),
      next: await this.prisma.contest.findFirst(navigate('next'))
    }
  }

  async registerContest({
    contestId,
    userId,
    invitationCode
  }: {
    contestId: number
    userId: number
    invitationCode?: string
  }) {
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId
      },
      select: {
        registerDueTime: true,
        invitationCode: true
      }
    })

    if (contest.invitationCode && contest.invitationCode !== invitationCode) {
      throw new ConflictFoundException('Invalid invitation code')
    }

    const hasRegistered = await this.prisma.contestRecord.findFirst({
      where: { userId, contestId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this contest')
    }
    const now = new Date()
    if (now >= contest.registerDueTime) {
      throw new ConflictFoundException(
        'Cannot participate in the contest after the registration deadline'
      )
    }
    return await this.prisma.$transaction(async (prisma) => {
      const contestRecord = await prisma.contestRecord.create({
        data: { contestId, userId }
      })

      await prisma.userContest.create({
        data: { contestId, userId, role: ContestRole.Participant }
      })

      return contestRecord
    })
  }

  async unregisterContest(contestId: number, userId: number) {
    const [contest, contestRecord] = await Promise.all([
      this.prisma.contest.findUnique({
        where: {
          id: contestId
        }
      }),
      this.prisma.contestRecord.findFirst({
        where: {
          userId,
          contestId
        }
      })
    ])

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    if (!contestRecord) {
      throw new EntityNotExistException('ContestRecord')
    }

    const now = new Date()
    if (now >= contest.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended contest'
      )
    }

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.userContest.delete({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { userId_contestId: { userId, contestId } }
      })

      return prisma.contestRecord.delete({
        where: { id: contestRecord.id }
      })
    })
  }

  async getContestLeaderboard(
    contestId: number,
    userId?: number,
    search?: string
  ) {
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId
      },
      select: {
        freezeTime: true,
        unfreeze: true,
        userContest: {
          where: {
            userId
          },
          select: {
            role: true
          }
        }
      }
    })
    const contestRole = userId ? (contest.userContest[0]?.role ?? null) : null
    const now = new Date()
    const isFrozen = Boolean(
      contest.freezeTime && now >= contest.freezeTime && !contest.unfreeze
    )

    const sum = await this.prisma.contestProblem.aggregate({
      where: {
        contestId
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _sum: {
        score: true
      }
    })
    const maxScore = sum._sum?.score ?? 0

    const scoreColumn = isFrozen ? 'score' : 'finalScore'
    const totalPenaltyColumn = isFrozen ? 'totalPenalty' : 'finalTotalPenalty'
    const contestRecords = await this.prisma.contestRecord.findMany({
      where: {
        contestId
      },
      select: {
        userId: true,
        user: {
          select: {
            username: true
          }
        },
        score: true,
        finalScore: true,
        totalPenalty: true,
        finalTotalPenalty: true,
        lastAcceptedTime: true,
        contestProblemRecord: {
          select: {
            score: true,
            timePenalty: true,
            submitCountPenalty: true,
            finalScore: true,
            finalSubmitCountPenalty: true,
            finalTimePenalty: true,
            isFirstSolver: true,
            contestProblem: {
              select: {
                id: true,
                order: true,
                problemId: true
              }
            }
          }
        }
      },
      orderBy: [
        { [scoreColumn]: 'desc' },
        { [totalPenaltyColumn]: 'asc' },
        { lastAcceptedTime: 'asc' }
      ]
    })

    // 문제별 제출 횟수 데이터 가져오기
    const submissionCounts = await this.prisma.submission.groupBy({
      by: ['userId', 'problemId'], // userId와 problemId로 그룹화
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _count: {
        id: true // 제출 횟수를 세기 위해 id를 카운트
      },
      where: {
        contestId
      }
    })

    let beforeFreezeSubmissionCounts
    if (contest?.freezeTime) {
      beforeFreezeSubmissionCounts = await this.prisma.submission.groupBy({
        by: ['userId', 'problemId'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          id: true
        },
        where: {
          contestId,
          createTime: {
            lt: contest.freezeTime
          }
        }
      })
    }

    // 유저별 문제별 제출 횟수를 매핑
    const submissionCountMap: Record<number, Record<number, number>> = {}

    for (const { userId, problemId, _count } of submissionCounts) {
      if (userId == null || problemId == null || _count?.id == null) continue

      if (!submissionCountMap[userId]) {
        submissionCountMap[userId] = {}
      }

      submissionCountMap[userId][problemId] = _count.id
    }

    // freeze 이전 제출 횟수 데이터 가져오기 (freeze 이후 제출 횟수와 비교하기 위함)
    const submissionCountMapBeforeFreeze: Record<
      number,
      Record<number, number>
    > = {}
    if (contest?.freezeTime && beforeFreezeSubmissionCounts) {
      for (const {
        userId,
        problemId,
        _count
      } of beforeFreezeSubmissionCounts) {
        if (userId == null || problemId == null || _count?.id == null) continue

        if (!submissionCountMapBeforeFreeze[userId]) {
          submissionCountMapBeforeFreeze[userId] = {}
        }

        submissionCountMapBeforeFreeze[userId][problemId] = _count.id
      }
    }

    const allProblems = await this.prisma.contestProblem.findMany({
      where: {
        contestId
      },
      select: {
        id: true,
        order: true,
        problemId: true
      },
      orderBy: {
        order: 'asc'
      }
    }) // 모든 문제 목록이 포함된 배열

    let rank = 1
    const leaderboard = contestRecords.map(
      ({
        contestProblemRecord,
        userId,
        score,
        finalScore,
        totalPenalty,
        finalTotalPenalty,
        user
      }) => {
        const getSubmissionCount = (problemId: number) => {
          const map = isFrozen
            ? submissionCountMapBeforeFreeze
            : submissionCountMap
          return map[userId!]?.[problemId] ?? 0
        }

        const getIsFrozen = (
          problemId: number,
          freezeScore: number,
          finalScore: number
        ) =>
          isFrozen &&
          (freezeScore !== finalScore ||
            submissionCountMapBeforeFreeze[userId!]?.[problemId] !==
              submissionCountMap[userId!]?.[problemId])

        const problemRecords = allProblems.map(({ id, order, problemId }) => {
          const record = contestProblemRecord.find(
            (r) => r.contestProblem.id === id
          )

          if (!record) {
            return {
              order,
              problemId,
              penalty: 0,
              submissionCount: getSubmissionCount(problemId),
              score: 0,
              isFrozen: getIsFrozen(problemId, 0, 0),
              isFirstSolver: false
            }
          }

          const {
            score: freezeScore,
            finalScore,
            submitCountPenalty,
            timePenalty,
            finalSubmitCountPenalty,
            finalTimePenalty,
            isFirstSolver
          } = record

          const penalty = isFrozen
            ? submitCountPenalty + timePenalty
            : finalSubmitCountPenalty + finalTimePenalty

          return {
            order,
            problemId,
            penalty,
            submissionCount: getSubmissionCount(problemId),
            score: isFrozen ? freezeScore : finalScore,
            isFrozen: getIsFrozen(problemId, freezeScore, finalScore),
            isFirstSolver
          }
        })

        return {
          username: user!.username,
          totalScore: isFrozen ? score : finalScore,
          totalPenalty: isFrozen ? totalPenalty : finalTotalPenalty,
          problemRecords,
          rank: rank++
        }
      }
    )

    const filteredLeaderboard = search
      ? leaderboard.filter(({ username }) =>
          username.toLowerCase().includes(search.toLowerCase())
        )
      : leaderboard

    return {
      contestRole,
      maxScore,
      leaderboard: filteredLeaderboard
    }
  }

  async getContestRoles(userId: number) {
    if (!userId) {
      return []
    }

    const userContests = await this.prisma.userContest.findMany({
      where: {
        userId
      },
      select: {
        contestId: true,
        role: true
      }
    })

    return userContests
  }

  /**
   * Contest에 대한 QnA를 생성합니다.
   * @param contestId - 대회 Id
   * @param userId - QnA를 생성하려는 User의 Id
   * @param data - 질문의 제목(title)과 내용(content)
   * @param problemId - 해당 QnA와 연관된 Problem의 Id(optional) -> 주어지지 않으면 카테고리 General로 설정
   * @throws { EntityNotExistException } - contestId에 대한 대회가 없는 경우
   * @throws { EntityNotExistException } - problemId가 해당 Contest에 등록되어있지 않은 경우
   * @throws { ForbiddenAccessException } - userId가 해당 Contest에 등록되어있지 않은 경우
   * @returns ContestQnA
   */
  async createContestQnA(
    contestId: number,
    userId: number,
    data: ContestQnACreateDto,
    problemId: number | undefined
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const hasRegistered = await this.prisma.userContest.findFirst({
      where: { userId, contestId }
    })
    if (!hasRegistered) {
      throw new ForbiddenAccessException('Not registered in this contest')
    }

    let categoryValue: QnACategory
    if (problemId === undefined) {
      categoryValue = QnACategory.General
    } else {
      categoryValue = QnACategory.Problem
      const contestProblem = await this.prisma.contestProblem.findFirst({
        where: {
          contestId: contestId,
          problemId: problemId
        }
      })
      if (!contestProblem) throw new EntityNotExistException('ContestProblem')
    }

    // 대회 중이면 isVisible을 false로 설정, 진행 중이 아니면 true로 설정
    const now = new Date()
    const isOngoing = contest.startTime <= now && now <= contest.endTime

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.contestQnA.aggregate({
        where: { contestId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const order = (maxOrder._max?.order ?? 0) + 1
      return await tx.contestQnA.create({
        data: {
          ...data,
          contestId,
          createdById: userId,
          order,
          category: categoryValue,
          isVisible: !isOngoing,
          ...(problemId !== undefined && { problemId })
        }
      })
    })
  }

  async getContestQnAs(
    userId: number | null,
    contestId: number,
    filter: GetContestQnAsFilter
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
  }

  /**
   * 특정 대회의 특정 순번(order)에 해당하는 QnA를 조회합니다.
   *
   * 이 함수는 다음과 같은 조건에 따라 QnA를 조회하고 반환합니다:
   * - 운영진(Admin, Manager, Reviewer)인 경우: 모든 QnA를 열람할 수 있습니다.
   * - 일반 사용자:
   *   - 로그인한 경우: 자신이 작성한 QnA 또는 공개된 QnA만 열람 가능합니다.
   *   - 로그인하지 않은 경우: 공개된 QnA만 열람 가능합니다.
   *
   * QnA를 찾을 수 없거나 접근 권한이 없는 경우 예외를 발생시킵니다.
   * - 운영진: QnA가 실제로 없으면 EntityNotExistException 발생
   * - 일반 사용자: 권한이 없는 경우 ForbiddenAccessException 발생
   *
   * 사용자가 대회에 등록되어 있지 않으면 제한된 필드(id, title, 작성자, 작성 시간 등)만 반환합니다.
   *
   * @param userId - 요청자의 사용자 ID (로그인하지 않은 경우 null)
   * @param contestId - 대상 대회의 ID
   * @param order - QnA의 순번(order)
   * @returns QnA 전체 정보 또는 제한된 정보
   * @throws EntityNotExistException - 대회 또는 QnA가 존재하지 않을 경우
   * @throws ForbiddenAccessException - 접근 권한이 없을 경우
   */
  async getContestQnA(userId: number | null, contestId: number, order: number) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const userContest = userId
      ? await this.prisma.userContest.findFirst({
          where: { userId, contestId }
        })
      : null

    const isPrivileged =
      userContest && ['Admin', 'Manager', 'Reviewer'].includes(userContest.role)

    const qna = await this.prisma.contestQnA.findFirst({
      where: {
        order,
        contestId,
        ...(isPrivileged
          ? {}
          : {
              OR: [{ createdById: userId ?? -1 }, { isVisible: true }]
            })
      },
      include: {
        createdBy: { select: { username: true } }
      }
    })

    if (!qna) {
      if (isPrivileged) {
        throw new EntityNotExistException('ContestQnA')
      } else {
        throw new ForbiddenAccessException(
          'You are not allowed to view this QnA'
        )
      }
    }

    if (!userContest) {
      const { id, title, createdBy, createdById, createTime } = qna
      return { id, title, createdBy, createdById, createTime }
    }
    return qna
  }

  /**
   * ContestQnA에 대한 댓글을 작성합니다
   *
   *
   * @param userId - 댓글을 작성하려는 User의 Id
   * @param contestQnAId - 댓글을 작성하려는 ContestQnA의 Id
   * @param content - 댓글 내용
   * @throws { ForbiddenAccessException } - 해당 QnA의 Writer 또는 Contest의 Staff(Admin/Manager/Reviewer)가 아닌 경우 반환합니다.
   * @throws { EntityNotExistException } - contestQnAId에 해당하는 ContestQnA가 존재하지 않는 경우 반환합니다.
   * @returns ContestQnAComment
   */
  async createContestQnAComment(
    userId: number,
    contestQnAId: number,
    content: string
  ) {
    const contestQnA = await this.prisma.contestQnA.findUnique({
      where: { id: contestQnAId }
    })

    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const staffUserContest = await this.prisma.userContest.findFirst({
      where: {
        userId: userId,
        role: { in: ['Admin', 'Manager', 'Reviewer'] }
      }
    })

    const isContestStaff = staffUserContest !== null
    const isWriter = contestQnA?.createdById == userId

    // 해당 QnA의 작성자 또는 대회 스태프만 댓글 작성 가능
    const isPrivileged = isWriter || isContestStaff
    if (!isPrivileged) {
      throw new ForbiddenAccessException(
        'Only Writer or Contest Staff can comment.'
      )
    }

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.contestQnAComment.aggregate({
        where: { contestQnAId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const order = (maxOrder._max?.order ?? 0) + 1
      return await tx.contestQnAComment.create({
        data: {
          content: content,
          contestQnAId: contestQnAId,
          createdById: userId,
          order
        }
      })
    })
  }
}
