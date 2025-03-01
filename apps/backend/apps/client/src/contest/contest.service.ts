import { Injectable } from '@nestjs/common'
import { ContestRole, Prisma, type Contest } from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'

const contestSelectOption = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  freezeTime: true,
  invitationCode: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  posterUrl: true,
  participationTarget: true,
  competitionMethod: true,
  rankingMethod: true,
  problemFormat: true,
  benefits: true,
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

  async getContest(id: number, userId?: number) {
    // check if the user has already registered this contest
    // initial value is false
    let isRegistered = false
    let contest: Partial<Contest>
    if (userId) {
      const hasRegistered = await this.prisma.contestRecord.findFirst({
        where: { userId, contestId: id }
      })
      if (hasRegistered) {
        isRegistered = true
      }
    }
    try {
      contest = await this.prisma.contest.findUniqueOrThrow({
        where: {
          id,
          isVisible: true
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
      ...contestDetails,
      invitationCodeExists,
      isRegistered,
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
        startTime: true,
        endTime: true,
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
    if (now >= contest.endTime) {
      throw new ConflictFoundException('Cannot participate ended contest')
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

  async isVisible(contestId: number): Promise<boolean> {
    return !!(await this.prisma.contest.count({
      where: {
        id: contestId,
        isVisible: true
      }
    }))
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

  async getContestLeaderboard(contestId: number, search?: string) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      select: {
        freezeTime: true
      }
    })
    const isFrozen =
      contest?.freezeTime != null && new Date() >= contest.freezeTime

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
    const totalPenaltyColumn = isFrozen ? 'finalTotalPenalty' : 'totalPenalty'
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
                order: true
              }
            }
          }
        }
      },
      orderBy: [
        { [scoreColumn]: 'desc' },
        { [totalPenaltyColumn]: 'asc' },
        {
          lastAcceptedTime: 'asc'
        }
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
    const submissionCountMap: {
      [userId: number]: { [problemId: number]: number }
    } = {}
    submissionCounts.forEach((submission) => {
      const { userId, problemId, _count } = submission
      if (!userId || !problemId || !_count) return
      if (!submissionCountMap[userId]) {
        submissionCountMap[userId] = {}
      }
      submissionCountMap[userId][problemId] = _count.id // 문제별 제출 횟수 저장
    })

    const submissionCountMapBeforeFreeze: {
      [userId: number]: { [problemId: number]: number }
    } = {}
    if (contest?.freezeTime) {
      beforeFreezeSubmissionCounts.forEach((submission) => {
        const { userId, problemId, _count } = submission
        if (!userId || !problemId || !_count) return
        if (!submissionCountMapBeforeFreeze[userId]) {
          submissionCountMapBeforeFreeze[userId] = {}
        }

        submissionCountMapBeforeFreeze[userId][problemId] = _count.id
      })
    }

    const allProblems = await this.prisma.contestProblem.findMany({
      where: {
        contestId
      },
      select: {
        id: true,
        order: true
      }
    }) // 모든 문제 목록이 포함된 배열

    let rank = 1
    const leaderboard = contestRecords.map((contestRecord) => {
      const {
        contestProblemRecord,
        userId,
        score,
        finalScore,
        totalPenalty,
        finalTotalPenalty,
        user
      } = contestRecord

      const problemRecords = allProblems.map((contestProblem) => {
        const record = contestProblemRecord.find(
          (r) => r.contestProblem.id === contestProblem.id
        )

        if (record) {
          const {
            contestProblem,
            score,
            submitCountPenalty,
            timePenalty,
            finalScore,
            finalSubmitCountPenalty,
            finalTimePenalty,
            isFirstSolver
          } = record

          return {
            order: contestProblem.order,
            problemId: contestProblem.id,
            penalty: isFrozen
              ? submitCountPenalty + timePenalty
              : finalSubmitCountPenalty + finalTimePenalty,
            submissionCount:
              submissionCountMap[userId!]?.[contestProblem.id] ?? 0,
            score: isFrozen ? score : finalScore,
            isFrozen:
              score !== finalScore ||
              submissionCountMapBeforeFreeze[userId!]?.[contestProblem.id] !==
                submissionCountMap[userId!]?.[contestProblem.id]
                ? true
                : false,
            isFirstSolver
          }
        } else {
          // contestProblemRecord가 없을 경우 기본값을 설정하여 반환
          return {
            order: contestProblem.order,
            problemId: contestProblem.id,
            penalty: 0, // 기본 패널티 값
            submissionCount:
              submissionCountMap[userId!]?.[contestProblem.id] ?? 0, // 기본 제출 횟수
            score: 0, // 기본 점수
            isFrozen: false,
            isFirstSolver: false
          }
        }
      })

      return {
        username: user!.username,
        totalScore: isFrozen ? score : finalScore,
        totalPenalty: isFrozen ? totalPenalty : finalTotalPenalty,
        problemRecords,
        rank: rank++
      }
    })

    const filteredLeaderboard = search
      ? leaderboard.filter(({ username }) =>
          username.toLowerCase().includes(search.toLowerCase())
        )
      : leaderboard

    return {
      maxScore,
      leaderboard: filteredLeaderboard
    }
  }

  async getContestRoles(userId: number) {
    if (!userId) {
      return {
        canCreateContest: false,
        userContests: []
      }
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
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        canCreateContest: true
      }
    })

    return {
      canCreateContest: user?.canCreateContest ?? false,
      userContests
    }
  }
}
