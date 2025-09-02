import { Injectable } from '@nestjs/common'
import {
  ContestRole,
  Prisma,
  QnACategory,
  Role,
  type Contest
} from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  GetContestQnAsFilter,
  type ContestQnACreateDto
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
   * @param userId - QnA를 생성하려는 User의 Id(비로그인 상태에서는 질문 생성 불가)
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
    order: number | undefined
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const now = new Date()
    const isOngoing = contest.startTime <= now && now <= contest.endTime

    // 대회 진행 중인 경우 대회에 등록한 참가자 또는 관리자만 질문 게시 가능
    if (isOngoing) {
      const hasRegistered = await this.prisma.userContest.findFirst({
        where: { userId, contestId }
      })
      if (!hasRegistered) {
        const user = await this.prisma.user.findFirst({
          where: {
            id: userId
          }
        })
        const isSuperAdmin = user?.role == Role.SuperAdmin
        if (!isSuperAdmin) {
          throw new ForbiddenAccessException('Not registered in this contest')
        }
      }
    }

    // 대회가 진행중이지 않은 경우 누구나 질문 게시 가능

    let categoryValue: QnACategory
    let problemId: number | null
    if (order === undefined) {
      categoryValue = QnACategory.General
      problemId = null
    } else {
      categoryValue = QnACategory.Problem
      const contestProblem = await this.prisma.contestProblem.findFirst({
        where: {
          contestId,
          order
        }
      })
      if (!contestProblem) throw new EntityNotExistException('ContestProblem')
      problemId = contestProblem.problemId
    }

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
          ...(problemId !== null && { problemId }),
          readBy: [userId]
        }
      })
    })
  }

  /**
   * 특정 대회에 대한 QnA들을 조회합니다.
   *
   * 대회가 진행중인 경우:
   *   - 대회 운영진은 모든 글을 열람할 수 있습니다.
   *   - 일반 사용자는 본인이 작성한 글만 열람할 수 있습니다.
   * 대회가 진행중이지 않은 경우:
   *   - 모든 사용자가 모든 글을 열람할 수 있습니다.
   *
   * @param userId - 요청하는 사용자의 Id(로그인하지 않으면 null, 이 경우 대회 진행 중 질문 조회 불가)
   * @param contestId - Contest의 Id
   * @param filter - 조회 필터
   *   - categories: QnACategory Enum의 값을 배열로 저장합니다.
   *   - problemOrders: QnA를 조회할 문제들의 대회에서의 order를 배열로 저장합니다.
   *   - orderBy: 조회할 QnA의 정렬 순서를 저장합니다. (asc: 오름차순 / desc: 내림차순)
   *   - search: 검색어를 저장합니다.
   * @throws { EntityNotExistException } - contestId에 해당하는 Contest가 존재하지 않으면 반환합니다.
   * @returns ContestQnA[]
   */
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

    let isPrivileged = false
    if (userId) {
      const contestStaff = await this.prisma.userContest.findFirst({
        where: {
          userId,
          contestId,
          role: { in: ['Admin', 'Manager', 'Reviewer'] }
        }
      })
      isPrivileged = contestStaff ? true : false
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId
        }
      })
      const isSuperAdmin = user?.role == Role.SuperAdmin
      if (isSuperAdmin) isPrivileged = true
    }

    const now = new Date()
    const isOngoing = contest.startTime <= now && now <= contest.endTime

    let visibleCondition = {}
    if (isOngoing) {
      if (userId == null) {
        throw new ForbiddenAccessException(
          'Cannot access to QnA of an ongoing contest without logging in.'
        )
      }
      if (!isPrivileged) {
        // 대회 운영진이 아닌 경우 전체 공개이거나 본인이 작성한 글만 볼 수 있음
        visibleCondition = {
          createdById: userId
        }
      }
    }

    // 대회 진행 중이 아니면 별도의 조건 필요 없음

    const baseWhere: Prisma.ContestQnAWhereInput = {
      contestId,
      ...visibleCondition
    }

    const categories = filter.categories ?? []
    const includeProblem = categories.includes(QnACategory.Problem)
    const general = categories.filter((c) => c !== QnACategory.Problem)

    const orConds: Prisma.ContestQnAWhereInput[] = []

    if (includeProblem) {
      if (filter.problemOrders?.length) {
        const problemIds = await this.prisma.contestProblem
          .findMany({
            where: { contestId, order: { in: filter.problemOrders } },
            select: { problemId: true }
          })
          .then((rs) => rs.map((r) => r.problemId))

        orConds.push({
          category: QnACategory.Problem,
          problemId: { in: problemIds }
        })
      } else {
        orConds.push({ category: QnACategory.Problem })
      }
    }

    if (general.length) {
      orConds.push({ category: { in: general } })
    }

    const searchFilter = filter.search
      ? {
          title: { contains: filter.search, mode: Prisma.QueryMode.insensitive }
        }
      : {}

    const where: Prisma.ContestQnAWhereInput = orConds.length
      ? {
          AND: [
            baseWhere,
            ...(filter.search ? [searchFilter] : []),
            { OR: orConds }
          ]
        }
      : { AND: [baseWhere, ...(filter.search ? [searchFilter] : [])] }

    const qnas = await this.prisma.contestQnA.findMany({
      select: {
        id: true,
        order: true,
        createdById: true,
        title: true,
        isResolved: true,
        category: true,
        problemId: true,
        createTime: true,
        createdBy: {
          select: {
            username: true
          }
        },
        readBy: true
      },
      where,
      orderBy: {
        order: 'desc'
      }
    })

    return qnas.map(({ readBy, ...rest }) => ({
      ...rest,
      isRead: userId == null || readBy.includes(userId)
    }))
  }

  /**
   * 특정 대회의 특정 order에 해당하는 QnA를 조회합니다.
   *
   * 이 함수는 다음과 같은 조건에 따라 QnA를 조회하고 반환합니다:
   * - 운영진(Admin, Manager, Reviewer): 모든 QnA를 열람할 수 있습니다.
   * - 일반 사용자:
   *   - 대회가 진행중인 경우: 본인이 작성한 QnA만 열람할 수 있습니다.
   *   - 대회가 진행중이지 않은 경우: 모든 QnA를 열람할 수 있습니다.
   *
   * QnA를 찾을 수 없거나 접근 권한이 없는 경우 예외를 발생시킵니다.
   * - 운영진: QnA가 실제로 없으면 EntityNotExistException 발생
   * - 일반 사용자: 권한이 없는 경우 ForbiddenAccessException 발생
   *
   *
   * @param userId - 요청자의 사용자 ID (로그인하지 않은 경우 null, 이 경우 대회 진행 중 질문 조회 불가)
   * @param contestId - Contest의 ID
   * @param order - Contest에서의 QnA 순서
   * @returns QnA 전체 정보
   * @throws EntityNotExistException - 대회 또는 QnA가 존재하지 않을 경우
   * @throws ForbiddenAccessException - 접근 권한이 없을 경우
   */
  async getContestQnA(userId: number | null, contestId: number, order: number) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      },
      include: {
        comments: {
          include: {
            createdBy: {
              select: {
                username: true
              }
            }
          }
        },
        createdBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const userContest = userId
      ? await this.prisma.userContest.findFirst({
          where: {
            userId,
            contestId
          }
        })
      : null

    const isContestStaff =
      userContest && ['Admin', 'Manager', 'Reviewer'].includes(userContest.role)

    let isSuperAdmin = false
    if (userId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId
        }
      })
      isSuperAdmin = user?.role == Role.SuperAdmin
    }

    const now = new Date()
    const isOngoing = contest.startTime <= now && now <= contest.endTime

    // 대회 진행 중에는 대회 관리자가 아닌 경우 본인이 작성한 글에만 접근 가능함
    if (
      isOngoing &&
      !isSuperAdmin &&
      !isContestStaff &&
      contestQnA.createdById != userId
    ) {
      throw new ForbiddenAccessException(
        'Only writer or contest staff can access during contest.'
      )
    }

    // readBy 배열에 해당 userId가 들어있지 않은 경우 추가
    if (userId != null && !contestQnA.readBy.includes(userId)) {
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
   * 특정 Contest의 order에 해당하는 QnA를 삭제합니다.
   * @param userId - 요청하는 사용자의 Id(비로그인 상태에서는 질문 삭제 불가)
   * @param contestId - 대회 Id
   * @param order - 삭제하려는 QnA의 대회 내에서의 순번
   * @throws { EntityNotExistException } - 입력받은 contestId에 해당하는 Contest가 존재하지 않을 시
   * @throws { EntityNotExistException } - 해당 Contest의 order에 해당하는 QnA가 존재하지 않을 시
   * @throws { ForbiddenAccessException } - 해당 QnA의 작성자 또는 대회 관리자 이외의 사용자가 요청할 시
   * @returns
   */
  async deleteContestQnA(userId: number, contestId: number, order: number) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      }
    })

    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const contestStaff = await this.prisma.userContest.findFirst({
      where: {
        userId,
        contestId,
        role: { in: ['Admin', 'Manager', 'Reviewer'] }
      }
    })

    const isContestStaff = contestStaff !== null

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    const isSuperAdmin = user?.role == Role.SuperAdmin

    if (!isContestStaff && !isSuperAdmin && contestQnA.createdById != userId) {
      throw new ForbiddenAccessException(
        'Only Writer or Contest Staff can delete QnA.'
      )
    }

    return await this.prisma.contestQnA.delete({
      where: { id: contestQnA.id }
    })
  }

  /**
   * ContestQnA에 대한 댓글을 작성합니다
   * 대회가 진행중이면 QnA 작성자와 대회 운영진만 댓글을 작성할 수 있습니다.
   * 대회가 진행중이지 않으면 누구나 작성할 수 있습니다.
   * @param userId - 댓글을 작성하려는 User의 Id(비로그인 상태에서는 댓글 생성 불가)
   * @param contestId - Contest의 Id
   * @param order - contest 내에서 QnA의 order
   * @param content - 댓글 내용
   * @throws { ForbiddenAccessException } - 해당 QnA의 Writer 또는 Contest의 Staff(Admin/Manager/Reviewer)가 아닌 경우 반환합니다.
   * @throws { EntityNotExistException } - contestId에 해당하는 Contest가 존재하지 않는 경우 반환합니다.
   * @throws { EntityNotExistException } - contestQnAId에 해당하는 ContestQnA가 존재하지 않는 경우 반환합니다.
   * @returns ContestQnAComment
   */
  async createContestQnAComment(
    userId: number,
    contestId: number,
    order: number,
    content: string
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      }
    })

    if (!contestQnA) {
      throw new EntityNotExistException('ContestQnA')
    }

    const contestQnAId = contestQnA.id

    const contestStaff = await this.prisma.userContest.findFirst({
      where: {
        userId,
        contestId,
        role: { in: ['Admin', 'Manager', 'Reviewer'] }
      }
    })

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    const isSuperAdmin = user?.role == Role.SuperAdmin

    const isContestStaff = contestStaff !== null || isSuperAdmin // Super도 대회 운영진 취급
    const isWriter = contestQnA?.createdById == userId
    const isPrivileged = isWriter || isContestStaff

    const now = new Date()
    const isOngoing = contest.startTime <= now && now <= contest.endTime

    if (isOngoing) {
      // 대회 진행 중에는 해당 QnA의 작성자 또는 대회 스태프만 댓글 작성 가능
      if (!isPrivileged) {
        throw new ForbiddenAccessException(
          'Only writer or contest staff can comment during contest.'
        )
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.contestQnAComment.aggregate({
        where: { contestQnAId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const order = (maxOrder._max?.order ?? 0) + 1
      const comment = await tx.contestQnAComment.create({
        data: {
          content,
          contestQnAId,
          createdById: userId,
          isContestStaff,
          order
        }
      })

      await tx.contestQnA.update({
        where: { id: contestQnAId },
        data: { isResolved: isContestStaff, readBy: { set: [userId] } }
      })

      return comment
    })
  }

  /**
   * ContestQnA에 대한 댓글을 삭제합니다.
   * @param userId - 요청한 사용자의 Id(비로그인 상태에서는 댓글 삭제 불가)
   * @param contestId - 대회 Id
   * @param qnAOrder - 해당 대회 내에서의 QnA의 순서
   * @param commentOrder - 해당 QnA 내에서 삭제할 댓글의 순서
   * @throws { EntityNotExistException } - contestId에 해당하는 Contest가 존재하지 않을 시
   * @throws { EntityNotExistException } - qnAOrder에 해당하는 QnA가 존재하지 않을 시
   * @throws { EntityNotExistException } - 해당 QnA의 commentOrder에 해당하는 댓글이 존재하지 않을 시
   * @throws { ForbiddenAccessException } - 해당 댓글의 작성자 또는 대회 관리자 이외의 사용자가 요청할 시
   * @returns
   */
  async deleteContestQnAComment(
    userId: number,
    contestId: number,
    qnAOrder: number,
    commentOrder: number
  ) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

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

    const contestStaff = await this.prisma.userContest.findFirst({
      where: {
        userId,
        contestId,
        role: { in: ['Admin', 'Manager', 'Reviewer'] }
      }
    })

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    const isSuperAdmin = user?.role == Role.SuperAdmin

    const isContestStaff = contestStaff !== null || isSuperAdmin

    if (!isContestStaff && contestQnAComment.createdById != userId) {
      throw new ForbiddenAccessException(
        'Only writer or contest staff can delete comment.'
      )
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

      // 남은 댓글이 있으면 해당 댓글의 작성자가 운영진일 시 true, 운영진이 아니거나 남은 댓글이 없으면 false
      const isResolved = lastComment ? lastComment.isContestStaff : false

      await tx.contestQnA.update({
        where: { id: contestQnA.id },
        data: { isResolved }
      })

      return deletedComment
    })
  }
}
