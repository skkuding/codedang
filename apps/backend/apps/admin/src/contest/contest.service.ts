import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Contest, ResultStatus, Submission } from '@generated'
import { ContestRole, Prisma, Role, type ContestProblem } from '@prisma/client'
import { Cache } from 'cache-manager'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ContestWithScores } from './model/contest-with-scores.model'
import type {
  CreateContestInput,
  UpdateContestInput
} from './model/contest.input'
import type { ProblemScoreInput } from './model/problem-score.input'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getContests(userId: number, take: number, cursor: number | null) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        role: true,
        canCreateContest: true
      }
    })
    const userContests = await this.prisma.userContest.findMany({
      where: {
        userId,
        role: {
          in: ['Admin', 'Manager', 'Reviewer']
        }
      }
    })

    if (
      user?.canCreateContest === false &&
      user.role === Role.User &&
      !userContests.length
    ) {
      throw new UnauthorizedException('You are not allowed to view contests')
    }

    const paginator = this.prisma.getPaginator(cursor)

    const contests = await this.prisma.contest.findMany({
      ...paginator,
      take,
      where: {
        ...(user?.role !== Role.SuperAdmin
          ? {
              userContest: {
                some: {
                  userId,
                  role: {
                    in: ['Admin', 'Manager', 'Reviewer']
                  }
                }
              }
            }
          : {})
      },
      include: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { contestRecord: true }
        }
      },
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }, { createTime: 'asc' }]
    })

    const now = new Date()
    const getStatusWeight = (contest: Contest) => {
      if (contest.startTime > now) return 0 // Upcoming
      if (contest.endTime <= now) return 2 // Finished
      return 1 // Ongoing
    }

    contests.sort((a, b) => {
      const statusA = getStatusWeight(a)
      const statusB = getStatusWeight(b)
      if (statusA !== statusB) return statusA - statusB

      const startDiff = a.startTime.getTime() - b.startTime.getTime()
      if (startDiff !== 0) return startDiff

      const endDiff = a.endTime.getTime() - b.endTime.getTime()
      if (endDiff !== 0) return endDiff

      return a.createTime.getTime() - b.createTime.getTime()
    })

    return contests.map((contest) => {
      const { _count, ...data } = contest
      return {
        ...data,
        participants: _count.contestRecord
      }
    })
  }

  async getContest(contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId
      },
      include: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { contestRecord: true }
        },
        userContest: {
          where: {
            role: {
              in: ['Manager', 'Reviewer']
            }
          },
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                username: true,
                email: true,
                userProfile: {
                  select: {
                    realName: true
                  }
                }
              }
            }
          }
        },
        contestRecord: {
          select: {
            userId: true,
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const { _count, ...data } = contest

    return {
      ...data,
      participants: _count.contestRecord
    }
  }

  async createContest(
    userId: number,
    contest: CreateContestInput
  ): Promise<Contest> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        role: true,
        canCreateContest: true
      }
    })
    if (user?.canCreateContest === false && user.role === Role.User) {
      throw new UnauthorizedException('You are not allowed to create a contest')
    }
    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }
    if (contest.registerDueTime >= contest.startTime) {
      throw new UnprocessableDataException(
        'The register due time must be earlier than the start time'
      )
    }
    if (contest.summary) {
      for (const [, val] of Object.entries(contest.summary)) {
        if (typeof val !== 'string') {
          throw new UnprocessableDataException(
            'Summary must contain only strings'
          )
        }
      }
    }

    const { summary, userContest, ...contestData } = contest

    if (userContest) {
      const validRoles = new Set(['Manager', 'Reviewer'])
      const seenUserIds = new Set<number>()

      for (const role of userContest) {
        if (!validRoles.has(role.contestRole)) {
          throw new UnprocessableDataException(
            `Invalid contest role : ${role.contestRole}`
          )
        }

        if (role.userId === userId) {
          throw new UnprocessableDataException(
            `User ${userId} is already assigned as Admin`
          )
        }

        if (seenUserIds.has(role.userId)) {
          throw new UnprocessableDataException(
            `User ${role.userId} has multiple roles in this request`
          )
        }

        seenUserIds.add(role.userId)
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const createdContest = await tx.contest.create({
        data: {
          createdById: userId,
          summary: summary
            ? (summary as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          ...contestData
        }
      })

      if (userContest?.length) {
        // created contest into newUserContests array

        await tx.userContest.createMany({
          data: userContest.map((role) => ({
            userId: role.userId,
            contestId: createdContest.id,
            role: role.contestRole as ContestRole
          }))
        })
      }

      await tx.userContest.create({
        data: {
          userId,
          contestId: createdContest.id,
          role: ContestRole.Admin
        }
      })

      const newUserContests = await tx.userContest.findMany({
        where: {
          contestId: createdContest.id
        }
      })

      return {
        ...createdContest,
        userContest: newUserContests
      }
    })

    // Contest 시작 전 알림 추가
    // await this.contestScheduler.scheduleStartReminder(
    //   created.id,
    //   created.startTime
    // )

    this.eventEmitter.emit('contest.created', {
      contestId: created.id,
      startTime: created.startTime
    })

    return created
  }

  async updateContest(
    contestId: number,
    contest: UpdateContestInput
  ): Promise<Contest> {
    const contestFound = await this.prisma.contest.findUniqueOrThrow({
      where: {
        id: contestId
      },
      select: {
        startTime: true,
        endTime: true,
        registerDueTime: true,
        unfreeze: true,
        freezeTime: true,
        contestProblem: {
          select: {
            problemId: true
          }
        },
        userContest: {
          where: {
            role: {
              in: ['Manager', 'Reviewer']
            }
          },
          select: {
            id: true,
            userId: true,
            role: true
          }
        }
      }
    })

    const isStartTimeChanged =
      contest.startTime && contest.startTime !== contestFound.startTime

    const isEndTimeChanged =
      contest.endTime && contest.endTime !== contestFound.endTime
    contest.startTime = contest.startTime || contestFound.startTime
    contest.endTime = contest.endTime || contestFound.endTime
    contest.registerDueTime =
      contest.registerDueTime || contestFound.registerDueTime
    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }
    if (contest.registerDueTime >= contest.startTime) {
      throw new UnprocessableDataException(
        'The register due time must be earlier than the start time'
      )
    }
    if (contest.summary) {
      for (const [, val] of Object.entries(contest.summary)) {
        if (typeof val !== 'string') {
          throw new UnprocessableDataException(
            'Summary must contain only strings'
          )
        }
      }
    }

    const isFreezeTimeChanged =
      contest.freezeTime && contest.freezeTime !== contestFound.freezeTime
    if (isFreezeTimeChanged) {
      const now = new Date()
      if (contest.freezeTime && contest.freezeTime <= now) {
        throw new UnprocessableDataException(
          'The freeze time must be later than the current time'
        )
      }
      if (contest.freezeTime && contest.freezeTime >= contest.endTime) {
        throw new UnprocessableDataException(
          'The freeze time must be earlier than the end time'
        )
      }

      const isOngoing =
        now >= contestFound.startTime && now < contestFound.endTime
      if (isOngoing) {
        if (
          contestFound.freezeTime &&
          contest.freezeTime &&
          contest.freezeTime < contestFound.freezeTime
        ) {
          throw new UnprocessableDataException(
            'The freeze time must be later than the previous freeze time'
          )
        }
        if (contestFound.freezeTime && contestFound.freezeTime <= now) {
          throw new UnprocessableDataException(
            'Cannot change freeze time after the freeze time has passed already'
          )
        }
      }
    }

    // unfreeze 상태 변경 시 예외 처리
    if (contest.unfreeze) {
      const now = new Date()
      if (!contestFound.freezeTime) {
        throw new UnprocessableDataException(
          'Cannot unfreeze a contest with no freezetime set'
        )
      }
      if (contestFound.unfreeze) {
        throw new UnprocessableDataException(
          'Cannot unfreeze a contest that has already been unfrozen'
        )
      }
      if (contestFound.freezeTime > now) {
        throw new UnprocessableDataException(
          'Cannot unfreeze a contest that has not been frozen yet'
        )
      }
      if (contestFound.endTime > now) {
        throw new UnprocessableDataException(
          'Cannot unfreeze a contest that has not ended yet'
        )
      }
    }

    const problemIds = contestFound.contestProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length && isEndTimeChanged) {
      for (const problemId of problemIds) {
        // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정
        let visibleLockTime = contest.endTime

        const contestIds = (
          await this.prisma.contestProblem.findMany({
            where: {
              problemId
            }
          })
        )
          .filter((contestProblem) => contestProblem.contestId !== contestId)
          .map((contestProblem) => contestProblem.contestId)

        if (contestIds.length) {
          const latestContest = await this.prisma.contest.findFirstOrThrow({
            where: {
              id: {
                in: contestIds
              }
            },
            orderBy: {
              endTime: 'desc'
            },
            select: {
              endTime: true
            }
          })
          if (contest.endTime < latestContest.endTime)
            visibleLockTime = latestContest.endTime
        }

        await this.prisma.problem.update({
          where: {
            id: problemId
          },
          data: {
            visibleLockTime
          }
        })
      }
    }

    const { summary, userContest: newRoles, ...contestData } = contest

    // userContest 중 삭제된 userContestRole 삭제, 추가된 userContestRole 추가, 변경된 userContestRole 변경
    if (newRoles) {
      const userContestRoles = contestFound.userContest
      const rolesToDelete = userContestRoles.filter(
        (role) => !newRoles.find((newRole) => newRole.userId === role.userId)
      )
      const rolesToAdd = newRoles.filter(
        (newRole) =>
          !userContestRoles.find((role) => role.userId === newRole.userId)
      )
      const rolesToUpdate = newRoles.filter((newRole) => {
        const role = userContestRoles.find(
          (role) => role.userId === newRole.userId
        )
        return role && role.role !== (newRole.contestRole as ContestRole)
      })

      await Promise.all([
        ...rolesToDelete.map((role) =>
          this.prisma.userContest.delete({
            where: {
              id: role.id
            }
          })
        ),
        ...rolesToAdd.map((role) =>
          this.prisma.userContest.create({
            data: {
              userId: role.userId,
              contestId,
              role: role.contestRole as ContestRole
            }
          })
        ),
        ...rolesToUpdate.map((role) =>
          this.prisma.userContest.update({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              userId_contestId: {
                userId: role.userId,
                contestId
              }
            },
            data: {
              role: role.contestRole as ContestRole
            }
          })
        )
      ])
    }

    const updated = await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...{ summary },
        ...contestData
      },
      include: {
        userContest: {
          where: {
            role: {
              in: ['Manager', 'Reviewer']
            }
          }
        }
      }
    })

    // startTime이 변경되었으면 알림 재스케줄링
    if (isStartTimeChanged) {
      this.eventEmitter.emit('contest.updated', {
        contestId: updated.id,
        startTime: updated.startTime
      })
    }

    return updated
  }

  async deleteContest(contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId
      },
      select: {
        contestProblem: {
          select: {
            problemId: true
          }
        }
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const problemIds = contest.contestProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length) {
      await this.removeProblemsFromContest(contestId, problemIds)
    }

    let deleted: Contest

    try {
      deleted = await this.prisma.contest.delete({
        where: {
          id: contestId
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }

    // Contest 시작 전 알림 삭제
    this.eventEmitter.emit('contest.deleted', deleted.id)

    return deleted
  }

  async importProblemsToContest(
    contestId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      include: {
        submission: {
          select: {
            id: true
          }
        }
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    let maxOrder =
      (
        await this.prisma.contestProblem.aggregate({
          where: { contestId },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _max: { order: true }
        })
      )._max?.order ?? -1

    const contestProblems: ContestProblem[] = []

    for (const { problemId, score } of problemIdsWithScore) {
      const isProblemAlreadyImported =
        await this.prisma.contestProblem.findFirst({
          where: {
            contestId,
            problemId
          }
        })
      if (isProblemAlreadyImported) {
        continue
      }

      try {
        const [contestProblem] = await this.prisma.$transaction([
          this.prisma.contestProblem.create({
            data: {
              order: ++maxOrder,
              contestId,
              problemId,
              score
            }
          }),
          this.prisma.problem.updateMany({
            where: {
              id: problemId,
              OR: [
                {
                  visibleLockTime: {
                    equals: MIN_DATE
                  }
                },
                {
                  visibleLockTime: {
                    equals: MAX_DATE
                  }
                },
                {
                  visibleLockTime: {
                    lte: contest.endTime
                  }
                }
              ]
            },
            data: {
              visibleLockTime: contest.endTime
            }
          })
        ])
        contestProblems.push(contestProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return contestProblems
  }

  async removeProblemsFromContest(contestId: number, problemIds: number[]) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      include: {
        submission: {
          select: {
            id: true
          }
        }
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestProblems: ContestProblem[] = []

    for (const problemId of problemIds) {
      // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정 (없을시 비공개 전환)
      let visibleLockTime = MAX_DATE

      const contestIds = (
        await this.prisma.contestProblem.findMany({
          where: {
            problemId
          }
        })
      )
        .filter((contestProblem) => contestProblem.contestId !== contestId)
        .map((contestProblem) => contestProblem.contestId)

      if (contestIds.length) {
        const latestContest = await this.prisma.contest.findFirst({
          where: {
            id: {
              in: contestIds
            }
          },
          orderBy: {
            endTime: 'desc'
          },
          select: {
            endTime: true
          }
        })

        if (!latestContest) {
          throw new EntityNotExistException('Contest')
        }

        visibleLockTime = latestContest.endTime
      }

      const removeContestProblem = await this.prisma.contestProblem.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId
          }
        }
      })
      if (!removeContestProblem) {
        throw new EntityNotExistException('ContestProblem')
      }

      try {
        const [, contestProblem] = await this.prisma.$transaction([
          this.prisma.problem.updateMany({
            where: {
              id: problemId,
              visibleLockTime: {
                lte: contest.endTime
              }
            },
            data: {
              visibleLockTime
            }
          }),
          this.prisma.contestProblem.delete({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              contestId_problemId: {
                contestId,
                problemId
              }
            }
          }),
          this.prisma.contestProblem.updateMany({
            where: {
              contestId,
              order: {
                gt: removeContestProblem.order
              }
            },
            data: {
              order: {
                decrement: 1
              }
            }
          })
        ])

        contestProblems.push(contestProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return contestProblems
  }

  /**
   * 특정 Contest의 Contest Admin / Manager가 참가한 User를 참가 취소합니다.
   * @param contestId 대회 Id
   * @param userId 참가 취소할 User의 Id
   * @param reqId Contest Admin / Manager Id
   * @throws {EntityNotExistException} 해당 contestId를 가지는 Contest가 존재하지 않을 경우
   * @throws {EntityNotExistException} 해당 Contest에 참여하고 있지 않은 userId인 경우
   * @throws {ForbiddenAccessException} ContestAdmin 또는 ContestManager가 아닌 reqId인 경우
   * @throws {ForbiddenAccessException} 진행 중이거나 종료된 Contest인 경우
   * @returns
   */
  async removeUserFromContest(
    contestId: number,
    userId: number,
    reqId: number
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })
    const contestRecord = await this.prisma.contestRecord.findFirst({
      where: {
        userId,
        contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const userContest = await this.prisma.userContest.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_contestId: {
          userId: reqId,
          contestId
        }
      }
    })

    if (
      !userContest ||
      (userContest.role !== ContestRole.Admin &&
        userContest.role !== ContestRole.Manager)
    ) {
      throw new ForbiddenAccessException(
        'Only Admin or Manager can remove users from contest'
      )
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
      await prisma.contestRecord.delete({
        where: { id: contestRecord.id }
      })

      return prisma.userContest.delete({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { userId_contestId: { userId, contestId } }
      })
    })
  }

  async getContestSubmissionSummaryByUserId({
    take,
    contestId,
    userId,
    problemId,
    cursor
  }: {
    take: number
    contestId: number
    userId: number
    problemId: number | null
    cursor: number | null
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        userId,
        contestId,
        problemId: problemId ?? undefined
      },
      include: {
        problem: {
          select: {
            title: true,
            contestProblem: {
              where: {
                contestId,
                problemId: problemId ?? undefined
              }
            }
          }
        },
        user: {
          select: {
            username: true,
            studentId: true
          }
        }
      }
    })

    const mappedSubmission = submissions.map((submission) => {
      return {
        contestId: submission.contestId,
        problemTitle: submission.problem.title,
        username: submission.user?.username,
        studentId: submission.user?.studentId,
        submissionResult: submission.result,
        language: submission.language,
        submissionTime: submission.createTime,
        codeSize: submission.codeSize,
        ip: submission.userIp,
        id: submission.id,
        problemId: submission.problemId,
        order: submission.problem.contestProblem.length
          ? submission.problem.contestProblem[0].order
          : null
      }
    })

    const scoreSummary = await this.getContestScoreSummary(userId, contestId)

    return {
      scoreSummary,
      submissions: mappedSubmission
    }
  }

  /**
   * 특정 user의 특정 Contest에 대한 총점, 통과한 문제 개수와 각 문제별 테스트케이스 통과 개수를 불러옵니다.
   */
  async getContestScoreSummary(userId: number, contestId: number) {
    const [contestProblems, rawSubmissions] = await Promise.all([
      this.prisma.contestProblem.findMany({
        where: {
          contestId
        }
      }),
      this.prisma.submission.findMany({
        where: {
          userId,
          contestId
        },
        orderBy: {
          createTime: 'desc'
        }
      })
    ])

    // 오직 현재 Contest에 남아있는 문제들의 제출에 대해서만 ScoreSummary 계산
    const contestProblemIds = contestProblems.map(
      (contestProblem) => contestProblem.problemId
    )
    const submissions = rawSubmissions.filter((submission) =>
      contestProblemIds.includes(submission.problemId)
    )

    if (!submissions.length) {
      return {
        submittedProblemCount: 0,
        totalProblemCount: contestProblems.length,
        userContestScore: 0,
        contestPerfectScore: contestProblems.reduce(
          (total, { score }) => total + score,
          0
        ),
        problemScores: []
      }
    }

    // 하나의 Problem에 대해 여러 개의 Submission이 존재한다면, 마지막에 제출된 Submission만을 점수 계산에 반영함
    const latestSubmissions: {
      [problemId: string]: {
        result: ResultStatus
        score: number // Problem에서 획득한 점수 (maxScore 만점 기준)
        maxScore: number // Contest에서 Problem이 갖는 배점(만점)
      }
    } = await this.getlatestSubmissions(submissions)

    const problemScores: {
      problemId: number
      score: number
      maxScore: number
    }[] = []

    for (const problemId in latestSubmissions) {
      problemScores.push({
        problemId: parseInt(problemId),
        score: latestSubmissions[problemId].score,
        maxScore: latestSubmissions[problemId].maxScore
      })
    }

    const scoreSummary = {
      submittedProblemCount: Object.keys(latestSubmissions).length, // Contest에 존재하는 문제 중 제출된 문제의 개수
      totalProblemCount: contestProblems.length, // Contest에 존재하는 Problem의 총 개수
      userContestScore: problemScores.reduce(
        (total, { score }) => total + score,
        0
      ), // Contest에서 유저가 받은 점수
      contestPerfectScore: contestProblems.reduce(
        (total, { score }) => total + score,
        0
      ), // Contest의 만점
      problemScores // 개별 Problem의 점수 리스트 (각 문제에서 몇 점을 획득했는지)
    }

    return scoreSummary
  }

  async getlatestSubmissions(submissions: Submission[]) {
    const latestSubmissions: {
      [problemId: string]: {
        result: ResultStatus
        score: number // Problem에서 획득한 점수
        maxScore: number // Contest에서 Problem이 갖는 배점
      }
    } = {}

    for (const submission of submissions) {
      const problemId = submission.problemId
      if (problemId in latestSubmissions) continue

      const contestProblem = await this.prisma.contestProblem.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId: submission.contestId!,
            problemId: submission.problemId
          }
        },
        select: {
          score: true
        }
      })

      if (!contestProblem) {
        throw new EntityNotExistException('ContestProblem')
      }

      const maxScore = contestProblem.score

      latestSubmissions[problemId] = {
        result: submission.result as ResultStatus,
        score: (submission.score / 100) * maxScore, // contest에 할당된 Problem의 총점에 맞게 계산
        maxScore
      }
    }

    return latestSubmissions
  }

  async getContestScoreSummaries({
    contestId,
    take,
    cursor,
    searchingName
  }: {
    contestId: number
    take: number
    cursor: number | null
    searchingName?: string
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const contestRecords = await this.prisma.contestRecord.findMany({
      ...paginator,
      where: {
        contestId,
        userId: {
          not: null
        },
        user: searchingName
          ? {
              userProfile: {
                realName: {
                  contains: searchingName,
                  mode: 'insensitive'
                }
              }
            }
          : undefined
      },
      take,
      include: {
        user: {
          select: {
            username: true,
            studentId: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            major: true
          }
        }
      },
      orderBy: {
        user: {
          studentId: 'asc'
        }
      }
    })

    const contestRecordsWithScoreSummary = await Promise.all(
      contestRecords.map(async (record) => {
        return {
          userId: record.userId,
          username: record.user?.username,
          studentId: record.user?.studentId,
          realName: record.user?.userProfile?.realName,
          major: record.user?.major,
          ...(await this.getContestScoreSummary(
            record.userId as number,
            contestId
          ))
        }
      })
    )

    return contestRecordsWithScoreSummary
  }

  async getContestsByProblemId(problemId: number) {
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: {
        problemId
      },
      select: {
        contest: true,
        score: true
      }
    })

    const contests = await Promise.all(
      contestProblems.map(async (contestProblem) => {
        return {
          ...contestProblem.contest,
          problemScore: contestProblem.score,
          totalScore: await this.getTotalScoreOfContest(
            contestProblem.contest.id
          )
        }
      })
    )

    const now = new Date()

    const contestsGroupedByStatus = contests.reduce(
      (acc, contest) => {
        if (contest.endTime > now) {
          if (contest.startTime <= now) {
            acc.ongoing.push(contest)
          } else {
            acc.upcoming.push(contest)
          }
        } else {
          acc.finished.push(contest)
        }
        return acc
      },
      {
        upcoming: [] as ContestWithScores[],
        ongoing: [] as ContestWithScores[],
        finished: [] as ContestWithScores[]
      }
    )

    return contestsGroupedByStatus
  }

  async getTotalScoreOfContest(contestId: number) {
    const contestProblemScores = await this.prisma.contestProblem.findMany({
      where: {
        contestId
      },
      select: {
        score: true
      }
    })

    return contestProblemScores.reduce(
      (total, problem) => total + problem.score,
      0
    )
  }

  async getContestLeaderboard(contestId: number, search?: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { id: true, freezeTime: true, unfreeze: true }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest is not found')
    }

    const participated = await this.prisma.submission.findMany({
      where: { contestId },
      distinct: ['userId']
    })

    const participatedNum = participated.length

    const registered = await this.prisma.contestRecord.findMany({
      where: { contestId },
      distinct: ['userId']
    })

    const registeredNum = registered.length

    // freeze 상태 확인
    const isFrozen =
      contest?.freezeTime != null &&
      new Date() >= contest.freezeTime &&
      !contest.unfreeze

    // Contest의 최고 점수 계산
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

    // 항상 finalScore, finalTotalPenalty 사용
    const contestRecords = await this.prisma.contestRecord.findMany({
      where: { contestId },
      select: {
        userId: true,
        user: { select: { username: true } },
        finalScore: true,
        finalTotalPenalty: true,
        lastAcceptedTime: true,
        contestProblemRecord: {
          select: {
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
        { finalScore: 'desc' },
        { finalTotalPenalty: 'asc' },
        { lastAcceptedTime: 'asc' }
      ]
    })

    // 문제별 제출 횟수 가져오기
    const submissionCounts = await this.prisma.submission.groupBy({
      by: ['userId', 'problemId'],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _count: { id: true },
      where: { contestId }
    })

    // 제출 횟수 매핑
    const submissionCountMap: Record<number, Record<number, number>> = {}
    for (const { userId, problemId, _count } of submissionCounts) {
      if (userId == null || problemId == null || _count?.id == null) continue
      if (!submissionCountMap[userId]) {
        submissionCountMap[userId] = {}
      }
      submissionCountMap[userId][problemId] = _count.id
    }

    // 모든 문제 목록 가져오기
    const allProblems = await this.prisma.contestProblem.findMany({
      where: { contestId },
      select: {
        id: true,
        order: true,
        problemId: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    let rank = 1
    const leaderboard = contestRecords.map((contestRecord) => {
      const { contestProblemRecord, user, userId, ...rest } = contestRecord

      const getSubmissionCount = (problemId: number) =>
        submissionCountMap[userId!]?.[problemId] ?? 0

      // 모든 문제에 대해 problemRecords 생성
      const problemRecords = allProblems.map(({ id, order, problemId }) => {
        const record = contestProblemRecord.find(
          (r) => r.contestProblem.id === id
        )

        if (!record) {
          return {
            order,
            problemId,
            score: 0,
            penalty: 0,
            isFirstSolver: false,
            submissionCount: getSubmissionCount(problemId)
          }
        }

        return {
          order,
          problemId,
          score: record.finalScore,
          penalty: record.finalSubmitCountPenalty + record.finalTimePenalty,
          isFirstSolver: record.isFirstSolver,
          submissionCount: getSubmissionCount(problemId)
        }
      })

      return {
        userId,
        username: user!.username,
        ...rest,
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
      participatedNum,
      registeredNum,
      leaderboard: filteredLeaderboard,
      isFrozen
    }
  }

  async getContestUpdateHistories(contestId: number) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { id: true, startTime: true, endTime: true }
    })

    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId },
      select: { problemId: true, order: true }
    })

    // 대회 진행 중 수정된 문제들의 update history 가져오기
    const contestUpdateHistories = await this.prisma.updateHistory.findMany({
      where: {
        problemId: {
          in: contestProblems.map((problem) => problem.problemId)
        },
        updatedAt: {
          gte: contest?.startTime,
          lte: contest?.endTime
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // order: ContestProblem의 order를 매핑
    return {
      updateHistories: contestUpdateHistories.map((history) => ({
        ...history,
        order:
          contestProblems.find(
            (problem) => problem.problemId === history.problemId
          )?.order ?? null
      }))
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

  async getContestQnAs(contestId: number) {
    return await this.prisma.contestQnA.findMany({
      where: {
        contestId
      },
      orderBy: {
        order: 'asc'
      }
    })
  }

  async getContestQnA(contestId: number, order: number) {
    return await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      }
    })
  }

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

  async createContestQnAComment(
    contestId: number,
    order: number,
    content: string,
    staffUserId: number
  ) {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Content cannot be empty')
    }

    // Contest가 존재하는지 확인
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    // ContestQnA가 존재하는지 확인
    const contestQnA = await this.prisma.contestQnA.findFirst({
      where: {
        contestId,
        order
      }
    })

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
          createdById: staffUserId,
          isContestStaff: true,
          order: commentOrder
        }
      })
      if (!contestQnA.isResolved) {
        await tx.contestQnA.update({
          where: { id: contestQnA.id },
          data: { isResolved: true }
        })
      }

      return comment
    })
  }

  async deleteContestQnAComment(
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
}
