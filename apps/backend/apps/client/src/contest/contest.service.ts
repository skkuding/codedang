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
    const contest = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId
      },
      select: {
        freezeTime: true,
        unfreeze: true
      }
    })

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
        const getSubmissionCount = (problemId: number) =>
          submissionCountMap[userId!]?.[problemId] >
          submissionCountMapBeforeFreeze?.[userId!]?.[problemId]
            ? submissionCountMap[userId!][problemId]
            : (submissionCountMapBeforeFreeze?.[userId!]?.[problemId] ?? 0)

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
              isFrozen: false,
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
}
