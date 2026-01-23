import { Injectable } from '@nestjs/common'
import {
  ContestRole,
  Language,
  Prisma,
  QnACategory,
  ResultStatus,
  Role
} from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
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

  /**
   * 모든 대회를 진행 중(ongoing), 예정(upcoming), 종료(finished) 상태로 분류하여 조회합니다.
   *
   * @param {number} [userId] 사용자 ID
   * @param {string} [search] 대회 제목 검색어
   * @returns `ongoing`, `upcoming`, `finished` 대회 리스트
   */
  async getContests(userId?: number, search?: string) {
    const now = new Date()

    const registeredContestIds = new Set<number>()
    if (userId) {
      const userRecords = await this.prisma.contestRecord.findMany({
        where: { userId },
        select: { contestId: true }
      })
      userRecords.forEach((record) =>
        registeredContestIds.add(record.contestId)
      )
    }

    const searchFilter = search
      ? { title: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {}

    const contests = await this.prisma.contest.findMany({
      where: searchFilter,
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }],
      select: contestSelectOption
    })

    const ongoing: ContestResult[] = []
    const upcoming: ContestResult[] = []
    const finished: ContestResult[] = []

    for (const contest of contests) {
      const { _count, ...rest } = contest

      const contestWithParticipantsAndIsRegistered: ContestResult & {
        isRegistered: boolean
      } = {
        ...rest,
        participants: _count.contestRecord,
        isRegistered: userId ? registeredContestIds.has(contest.id) : false
      }

      if (contest.endTime <= now) {
        finished.push(contestWithParticipantsAndIsRegistered)
      } else if (contest.startTime <= now) {
        ongoing.push(contestWithParticipantsAndIsRegistered)
      } else {
        upcoming.push(contestWithParticipantsAndIsRegistered)
      }
    }

    return {
      ongoing,
      upcoming,
      finished
    }
  }

  /**
   * 메인 배너에 표시할 두 개의 대회 ID를 조회합니다.
   * 1. 가장 빨리 시작하는 예정된 대회
   * 2. 가장 많은 인원이 등록한 예정된 대회
   *
   * @returns `fastestUpcomingContestId`, `mostRegisteredId` 대회 정보
   */
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

  /**
   * 특정 대회의 상세 정보를 조회합니다.
   *
   * @param {number} id 대회 ID
   * @param {number} [userId] 사용자 ID
   * @returns 대회 상세 정보
   */
  async getContest(id: number, userId?: number | null) {
    const contestDetailSelect: Prisma.ContestSelect = {
      ...contestSelectOption,
      description: true,
      createTime: true
    }

    if (userId) {
      contestDetailSelect.contestRecord = {
        where: { userId },
        select: { userId: true }
      }
      contestDetailSelect.userContest = {
        where: {
          userId,
          role: {
            in: [ContestRole.Admin, ContestRole.Manager, ContestRole.Reviewer]
          }
        },
        select: { role: true }
      }
    }

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return this.prisma.contest.findFirst({
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
      })
    }

    try {
      const [contestResult, prev, next] = await Promise.all([
        this.prisma.contest.findUniqueOrThrow({
          where: { id },
          select: contestDetailSelect
        }),
        navigate('prev'),
        navigate('next')
      ])

      const { invitationCode, contestRecord, userContest, ...contestDetails } =
        contestResult as typeof contestResult & {
          contestRecord?: { userId: number }[]
          userContest?: { role: ContestRole }[]
        }

      const invitationCodeExists = invitationCode != null
      const isRegistered = !!contestRecord?.length
      const isPrivilegedRole = !!userContest?.length

      return {
        ...contestDetails,
        invitationCodeExists,
        isRegistered,
        isPrivilegedRole,
        prev,
        next
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Contest')
      }
      throw error
    }
  }

  /**
   * 사용자가 대회에 등록합니다.
   *
   * @param {object} params 등록에 필요한 정보
   * @returns 생성된 대회 참가 기록
   */
  async registerContest({
    contestId,
    userId,
    invitationCode
  }: {
    contestId: number
    userId: number
    invitationCode?: string
  }) {
    const [contest, hasRegistered] = await Promise.all([
      this.prisma.contest.findUniqueOrThrow({
        where: {
          id: contestId
        },
        select: {
          registerDueTime: true,
          invitationCode: true
        }
      }),
      this.prisma.contestRecord.findFirst({
        where: { userId, contestId },
        select: { id: true }
      })
    ])

    if (contest.invitationCode && contest.invitationCode !== invitationCode) {
      throw new ConflictFoundException('Invalid invitation code')
    }
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

  /**
   * 대회 참가를 취소합니다.
   * 단, 대회가 시작된 후에는 취소할 수 없습니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} userId 사용자 ID
   * @returns 삭제된 대회 참가 기록
   */
  async unregisterContest(contestId: number, userId: number) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      select: { startTime: true }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const now = new Date()
    if (now >= contest.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended contest'
      )
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.userContest.delete({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { userId_contestId: { userId, contestId } }
        })

        return prisma.contestRecord.delete({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { contestId_userId: { contestId, userId } }
        })
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('ContestRecord')
      }
      throw error
    }
  }

  /**
   * 대회의 리더보드를 조회합니다.
   * Freeze/Unfreeze 상태를 반영합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} [userId] 사용자 ID
   * @param {string} [search] 사용자 이름 필터링
   * @returns 대회 Leaderboard 정보
   */
  async getContestLeaderboard(
    contestId: number,
    userId?: number,
    search?: string
  ) {
    const [contest, sum, submissionCounts, allProblems] = await Promise.all([
      this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: {
          freezeTime: true,
          unfreeze: true,
          userContest: {
            where: { userId },
            select: { role: true }
          }
        }
      }),
      this.prisma.contestProblem.aggregate({
        where: { contestId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _sum: { score: true }
      }),
      this.prisma.submission.groupBy({
        by: ['userId', 'problemId'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { id: true },
        where: { contestId }
      }),
      this.prisma.contestProblem.findMany({
        where: { contestId },
        select: { id: true, order: true, problemId: true },
        orderBy: { order: 'asc' }
      })
    ])

    const contestRole = userId ? (contest.userContest[0]?.role ?? null) : null
    const now = new Date()
    const isFrozen = Boolean(
      contest.freezeTime && now >= contest.freezeTime && !contest.unfreeze
    )
    const maxScore = sum._sum?.score ?? 0

    const contestRecordsPromise = this.prisma.contestRecord.findMany({
      where: { contestId },
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
        { [isFrozen ? 'score' : 'finalScore']: 'desc' },
        { [isFrozen ? 'totalPenalty' : 'finalTotalPenalty']: 'asc' },
        { lastAcceptedTime: 'asc' }
      ]
    })

    const beforeFreezePromise = contest.freezeTime
      ? this.prisma.submission.groupBy({
          by: ['userId', 'problemId'],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: { id: true },
          where: {
            contestId,
            createTime: { lt: contest.freezeTime }
          }
        })
      : Promise.resolve(undefined)

    const [contestRecords, beforeFreezeSubmissionCounts] = await Promise.all([
      contestRecordsPromise,
      beforeFreezePromise
    ])

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
          userId,
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

  /**
   * 특정 사용자가 참여하거나 관리하는 모든 대회의 역할(Role) 목록을 조회합니다.
   *
   * @param {number} userId 사용자 ID
   * @returns 사용자가 속한 대회 ID와 역할
   */
  async getContestRoles(userId: number) {
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

  /**
   * (private) 대회의 존재 여부 및 종료 여부를 검증합니다
   */
  private async checkIsContestExistsAndEnded(contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
    const now = new Date()
    if (contest.endTime > now) {
      throw new ForbiddenAccessException(
        'You can access to statistics after contest ends.'
      )
    }
  }

  /**
   * 특정 대회에 해당하는 대회 문제들의 목록을 반환합니다.
   * @param contestId - 조회할 대회의 Id
   * @returns contestProblem[]
   */
  async getContestProblems(contestId: number) {
    await this.checkIsContestExistsAndEnded(contestId)

    return await this.prisma.contest.findFirst({
      where: { id: contestId },
      select: {
        contestProblem: {
          select: {
            problemId: true,
            problem: {
              select: { title: true }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  }

  /**
   * 특정 대회 문제에 대한 통계를 반환합니다.
   * @param userId - 요청하는 유저의 Id
   * @param contestId - 조회할 대회의 Id
   * @param problemId - 조회할 문제의 Id
   * @returns totalSubmissionCount - 전체 제출 수
   * @returns acceptedSubmissionCount - 정답 제출 수
   * @returns acceptedRate - 정답률(제출 수 기준)
   * @returns averageTrial - 평균 시도 횟수
   * @returns firstSolver - 최단 정답자(제출시간 기준)
   * @returns fastestSolver - 최단 정답자(cpuTime 기준)
   * @returns userSpeedRank - 요청 유저의 제출시간 등수(정답을 맞추지 못한 경우 null)
   * @returns acceptedSubmissionsByLanguage - 언어별 정답 제출 수
   */
  async getStatisticsByProblem(
    userId: number,
    contestId: number,
    problemId: number
  ) {
    await this.checkIsContestExistsAndEnded(contestId)

    const [contestProblem, allSubmissions] = await Promise.all([
      this.prisma.contestProblem.findFirst({
        where: { contestId, problemId },
        select: { problem: { select: { languages: true } } }
      }),
      this.prisma.submission.findMany({
        where: {
          contestId,
          problemId
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true
            }
          },
          submissionResult: {
            select: { cpuTime: true }
          },
          language: true,
          result: true,
          createTime: true
        },
        orderBy: {
          createTime: 'asc'
        }
      })
    ])

    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }

    // 해당 contestProblem에 대한 submission 조회

    const totalSubmissionCount = allSubmissions.length
    const acceptedSubmissions = allSubmissions.filter((submission) => {
      return submission.result == ResultStatus.Accepted
    })
    const acceptedSubmissionCount = acceptedSubmissions.length
    const acceptedRate =
      acceptedSubmissionCount > 0
        ? (acceptedSubmissionCount / totalSubmissionCount).toFixed(1)
        : '0.0'

    const uniqueSubmitterIds = new Set<number>()
    for (const s of allSubmissions) {
      const uid = s.user?.id
      if (uid) uniqueSubmitterIds.add(uid)
    }
    const submittedParticipantsCount = uniqueSubmitterIds.size
    const averageTrial =
      submittedParticipantsCount > 0
        ? (totalSubmissionCount / submittedParticipantsCount).toFixed(1)
        : '0.0'

    // acceptedSubmissions에서 특정 유저의 중복 정답 제출이 있는 경우 제출 시각이 가장 빠른 것만 유지
    const uniqueAcceptedSubmissions = new Map<
      number,
      (typeof acceptedSubmissions)[0]
    >()
    for (const submission of acceptedSubmissions) {
      const userId = submission.user?.id
      if (userId && !uniqueAcceptedSubmissions.has(userId)) {
        uniqueAcceptedSubmissions.set(userId, submission)
      }
    }
    const deduplicatedAcceptedSubmissions = Array.from(
      uniqueAcceptedSubmissions.values()
    )

    const firstSolver = deduplicatedAcceptedSubmissions[0]?.user ?? null

    let fastestUser: { id: number; username: string } | null = null
    let minTime: bigint | null = null

    for (const sub of deduplicatedAcceptedSubmissions) {
      const maxElapsedTime = sub.submissionResult.reduce((max, r) => {
        const cpuTime = r.cpuTime ?? BigInt(0)
        return cpuTime > max ? cpuTime : max
      }, BigInt(0))

      if (sub.user?.id) {
        if (minTime === null || maxElapsedTime < minTime) {
          minTime = maxElapsedTime
          fastestUser = sub.user
        }
      }
    }

    const fastestSolver = fastestUser

    const idx = deduplicatedAcceptedSubmissions.findIndex(
      (s) => s.user?.id === userId
    )
    const userSpeedRank = idx === -1 ? null : idx + 1

    // 해당 problem에서 사용가능한 언어 집합
    const allowedLanguage = new Set<Language>(
      contestProblem.problem.languages ?? []
    )

    const acceptedSubmissionsByLanguage = new Map<Language, number>()
    for (const lang of allowedLanguage)
      acceptedSubmissionsByLanguage.set(lang, 0)

    for (const s of acceptedSubmissions) {
      const lang = s.language
      if (allowedLanguage.has(lang)) {
        acceptedSubmissionsByLanguage.set(
          lang,
          (acceptedSubmissionsByLanguage.get(lang) ?? 0) + 1
        )
      }
    }

    // 제출 수가 0인 언어는 제외하고 배열 생성
    const acceptedSubmissionsByLanguageArray = Array.from(
      acceptedSubmissionsByLanguage.entries()
    )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, count]) => count > 0)
      .map(([language, count]) => ({ language, count }))

    return {
      totalSubmissionCount,
      acceptedSubmissionCount,
      acceptedRate,
      averageTrial,
      firstSolver,
      fastestSolver,
      userSpeedRank,
      acceptedSubmissionsByLanguage: acceptedSubmissionsByLanguageArray
    }
  }

  /**
   * 실시간 리더보드를 위해 대회의 모든 Submission을 반환합니다.
   * @param contestId - 조회할 대회의 ID
   * @returns submissionsWithOrder - 실시간 리더보드 구현에 필요한 형태의 Submission 리스트
   */
  async getAllSubmissionsByContest(contestId: number) {
    await this.checkIsContestExistsAndEnded(contestId)

    const [contestProblems, submissions] = await Promise.all([
      this.prisma.contestProblem.findMany({
        where: {
          contestId
        },
        select: {
          problemId: true,
          order: true
        }
      }),
      this.prisma.submission.findMany({
        where: { contestId },
        select: {
          problemId: true,
          problem: {
            select: {
              title: true
            }
          },
          userId: true,
          user: {
            select: {
              username: true
            }
          },
          result: true,
          language: true,
          codeSize: true,
          id: true,
          createTime: true
        }
      })
    ])

    const problemOrderMap = new Map(
      contestProblems.map((cp) => [cp.problemId, cp.order])
    )

    return submissions.map((submission) => {
      const { user, problem, ...rest } = submission
      const order = problemOrderMap.get(submission.problemId)
      if (order === undefined) {
        throw new UnprocessableDataException(
          `Problem ${submission.problemId} is not found in contest ${contestId}`
        )
      }
      return {
        ...rest,
        username: user!.username,
        title: problem!.title,
        order
      }
    })
  }
  /**
   * 대회 statistics 페이지의 문제별 통계 그래프를 조회합니다.
   * 대회 종료 후에만 조회할 수 있습니다.
   *
   * 오답 분포(distribution)와 시간별 제출 추이(timeline) 통계를 모두 반환합니다.
   */
  async getContestProblemStatistics({
    contestId,
    problemId
  }: {
    contestId: number
    problemId: number
  }) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        startTime: true,
        endTime: true
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestProblem = await this.prisma.contestProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId,
          problemId
        }
      },
      select: { id: true }
    })

    if (!contestProblem) {
      throw new EntityNotExistException('Problem')
    }

    const now = new Date()

    if (!contest.endTime || now < contest.endTime) {
      throw new ForbiddenAccessException(
        'Contest problem statistics are available after the contest ends'
      )
    }

    const [distribution, timeline] = await Promise.all([
      this.getProblemDistribution({
        contestId,
        problemId
      }),
      this.getProblemTimeline({
        contestId,
        problemId,
        startTime: contest.startTime,
        endTime: contest.endTime
      })
    ])

    return {
      contestId,
      problemId,
      distribution,
      timeline
    }
  }

  /**
   * 문제 제출 결과 분포 통계를 계산합니다.
   *
   * 결과 유형별 제출 수를 집계합니다.
   * 결과 유형: WA, TLE, MLE, RE(RE, SFE), CE, ETC(SE, OLE)
   */
  private static readonly resultTypes = [
    'WA',
    'TLE',
    'MLE',
    'RE',
    'CE',
    'ETC'
  ] as const

  private async getProblemDistribution({
    contestId,
    problemId
  }: {
    contestId: number
    problemId: number
  }) {
    const [resultGroups] = await Promise.all([
      this.prisma.submission.groupBy({
        by: ['result'],
        where: {
          contestId,
          problemId,
          userId: {
            not: null
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { _all: true }
      })
    ])

    // 유형별 카운트 객체들 초기화
    const resultTypes = ContestService.resultTypes
    const counts: Record<(typeof ContestService.resultTypes)[number], number> =
      resultTypes.reduce(
        (accumulator, type) => {
          accumulator[type] = 0
          return accumulator
        },
        {} as Record<(typeof ContestService.resultTypes)[number], number>
      )

    // 통계 결과 유형 매핑
    const statusMap = {
      [ResultStatus.WrongAnswer]: resultTypes[0],
      [ResultStatus.TimeLimitExceeded]: resultTypes[1],
      [ResultStatus.MemoryLimitExceeded]: resultTypes[2],
      [ResultStatus.RuntimeError]: resultTypes[3],
      [ResultStatus.SegmentationFaultError]: resultTypes[3],
      [ResultStatus.CompileError]: resultTypes[4],
      [ResultStatus.ServerError]: resultTypes[5],
      [ResultStatus.OutputLimitExceeded]: resultTypes[5]
    } as Partial<
      Record<ResultStatus, (typeof ContestService.resultTypes)[number]>
    >

    let totalSubmissions = 0

    for (const group of resultGroups) {
      //  해당 유형 카운트 누적
      const key = statusMap[group.result as keyof typeof statusMap]
      const submissionCount = group._count._all
      totalSubmissions += submissionCount
      if (!key) {
        continue
      }
      counts[key] += submissionCount
    }

    return {
      totalSubmissions,
      counts
    }
  }

  /**
   * 문제 제출 타임라인 통계를 계산합니다.
   *
   * 대회 기간을 6등분하여 각 시간대별 Accepted와 Wrong 제출 수를 집계합니다.
   * 타임슬롯 간격은 대회 시간에 따라 동적으로 결정됩니다 (예: 3시간 대회 → 30분, 6시간 대회 → 1시간).
   * Wrong 유형: WA, TLE, MLE, RE(RE, SFE), CE, ETC(SE, OLE)
   * NA는 제출하지 않은 경우이므로 타임라인 그래프에 포함되지 않습니다.
   */
  private async getProblemTimeline({
    contestId,
    problemId,
    startTime,
    endTime
  }: {
    contestId: number
    problemId: number
    startTime: Date
    endTime: Date
  }) {
    const start = startTime.getTime()
    const end = endTime.getTime()
    const durationMs = end - start
    const slotCount = 6
    const intervalMs = durationMs / slotCount

    const slots = Array.from({ length: slotCount }, (_, index) => ({
      timestamp: new Date(start + index * intervalMs).toISOString(),
      accepted: 0,
      wrong: 0
    }))

    // 제출 생성 시각을 동적 간격 슬롯에 매핑해 Accepted/Not Accepted를 기록.
    const submissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        problemId,
        userId: {
          not: null
        },
        createTime: {
          gte: startTime,
          lte: endTime
        }
      },
      select: {
        result: true,
        createTime: true
      },
      orderBy: {
        createTime: 'asc'
      }
    })

    if (durationMs <= 0 || submissions.length === 0) {
      return {
        intervalMinutes: 0,
        series: slots
      }
    }

    const intervalMinutes = Math.max(1, Math.floor(intervalMs / (60 * 1000)))

    for (const submission of submissions) {
      const time = submission.createTime.getTime()
      if (time < start || time > end) {
        continue
      }

      const slotIndex = Math.min(
        Math.floor((time - start) / intervalMs),
        slots.length - 1
      )

      if (submission.result === ResultStatus.Accepted) {
        slots[slotIndex].accepted += 1
      } else if (
        (
          [
            ResultStatus.WrongAnswer,
            ResultStatus.TimeLimitExceeded,
            ResultStatus.MemoryLimitExceeded,
            ResultStatus.RuntimeError,
            ResultStatus.SegmentationFaultError,
            ResultStatus.CompileError,
            ResultStatus.ServerError,
            ResultStatus.OutputLimitExceeded
          ] as ResultStatus[]
        ).includes(submission.result)
      ) {
        slots[slotIndex].wrong += 1
      }
    }

    return {
      intervalMinutes,
      series: slots
    }
  }
}
