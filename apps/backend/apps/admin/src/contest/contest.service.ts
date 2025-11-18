import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Contest, ResultStatus, Submission } from '@generated'
import { ContestRole, Prisma, Role } from '@prisma/client'
import { Cache } from 'cache-manager'
import { MAX_DATE } from '@libs/constants'
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

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * 대회 목록을 조회합니다.
   * (SuperAdmin 제외) 자신이 'Admin', 'Manager', 'Reviewer'로 속한 대회만 조회합니다.
   *
   * @param {number} userId 사용자 ID
   * @param {number} take 페이지당 가져올 대회 수
   * @param {number | null} cursor 페이지네이션 커서 ID
   * @returns 대회 리스트
   */
  async getContests(userId: number, take: number, cursor: number | null) {
    const [user, userContests] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, canCreateContest: true }
      }),
      this.prisma.userContest.findMany({
        where: {
          userId,
          role: {
            in: [ContestRole.Admin, ContestRole.Manager, ContestRole.Reviewer]
          }
        },
        select: { contestId: true }
      })
    ])

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
                    in: [
                      ContestRole.Admin,
                      ContestRole.Manager,
                      ContestRole.Reviewer
                    ]
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

    // Upcoming, Ongoing, Finished 순으로 정렬
    // 대회 상태가 같다면, 시작 시각 빠른 순, 종료 시각이 빠른 순, 생성 시각이 빠른 순으로 정렬
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

  /**
   * 특정 대회 상세 정보를 조회합니다.
   *
   * @param {number} contestId - 대회 ID
   * @returns 특정 대회 상세 정보
   */
  async getContest(contestId: number) {
    const contest = await this.prisma.contest.findUnique({
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
              in: [ContestRole.Manager, ContestRole.Reviewer]
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

  /**
   * 새로운 대회를 생성합니다.
   * 해당 대회의 'Admin'이 됩니다.
   *
   * @param {number} userId 사용자 ID
   * @param {CreateContestInput} contest 생성할 대회 정보
   * @returns 생성된 대회 정보
   */
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
        'StartTime must be earlier than EndTime'
      )
    }
    if (contest.registerDueTime >= contest.startTime) {
      throw new UnprocessableDataException(
        'RegisterDueTime must be earlier than StartTime'
      )
    }
    if (
      contest.summary &&
      !Object.values(contest.summary).every((val) => typeof val === 'string')
    ) {
      throw new UnprocessableDataException('Summary must contain only strings')
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
        const userContestData = userContest.map((role) => ({
          userId: role.userId,
          contestId: createdContest.id,
          role: role.contestRole as ContestRole
        }))

        await tx.userContest.createMany({
          data: userContestData
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

  /**
   * 기존 대회의 정보를 수정합니다.
   * 대회 종료 시간(`endTime`) 변경 시, 연결된 문제들의 `visibleLockTime`을 재계산합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {UpdateContestInput} contest 수정할 대회의 데이터
   * @returns 업데이트된 대회 정보
   */
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
              in: [ContestRole.Manager, ContestRole.Reviewer]
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
    if (
      contest.summary &&
      !Object.values(contest.summary).every((val) => typeof val === 'string')
    ) {
      throw new UnprocessableDataException('Summary must contain only strings')
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
      const updateLockTimePromises = problemIds.map(async (problemId) => {
        // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정
        let visibleLockTime = contest.endTime!

        const otherContestIds = (
          await this.prisma.contestProblem.findMany({
            where: {
              problemId,
              contestId: { not: contestId }
            },
            select: { contestId: true }
          })
        ).map((cp) => cp.contestId)

        if (otherContestIds.length) {
          const latestContest = await this.prisma.contest.findFirstOrThrow({
            where: { id: { in: otherContestIds } },
            orderBy: { endTime: 'desc' },
            select: { endTime: true }
          })

          if (visibleLockTime < latestContest.endTime) {
            visibleLockTime = latestContest.endTime
          }
        }

        return this.prisma.problem.update({
          where: { id: problemId },
          data: { visibleLockTime }
        })
      })

      await Promise.all(updateLockTimePromises)
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
              in: [ContestRole.Manager, ContestRole.Reviewer]
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

  /**
   * 대회를 삭제합니다.
   * 대회에 속해있던 문제들의 `visibleLockTime`을 업데이트합니다.
   *
   * @param {number} contestId 대회 ID
   * @returns 삭제된 대회 정보
   */
  async deleteContest(contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId },
      select: {
        contestProblem: {
          select: { problemId: true }
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
      const updateLockTimePromises = problemIds.map(async (problemId) => {
        const otherContests = await this.prisma.contest.findMany({
          where: {
            contestProblem: { some: { problemId } },
            id: { not: contestId }
          },
          select: { endTime: true },
          orderBy: { endTime: 'desc' }
        })

        const newVisibleLockTime = otherContests[0]?.endTime ?? MAX_DATE

        return this.prisma.problem.update({
          where: { id: problemId },
          data: { visibleLockTime: newVisibleLockTime }
        })
      })

      await Promise.all(updateLockTimePromises)
    }

    const deleted = await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })

    // Contest 시작 전 알림 삭제
    this.eventEmitter.emit('contest.deleted', deleted.id)

    return deleted
  }

  /**
   * 특정 Contest의 Contest Admin / Manager가 참가한 User를 참가 취소합니다.
   * @param contestId 대회 ID
   * @param userId 사용자 ID
   * @param reqId Contest Admin / Manager ID
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
    const [contest, contestRecord, requesterRole] = await Promise.all([
      this.prisma.contest.findUnique({
        where: { id: contestId },
        select: { startTime: true }
      }),
      this.prisma.contestRecord.findFirst({
        where: { userId, contestId },
        select: { id: true }
      }),
      this.prisma.userContest.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_contestId: {
            userId: reqId,
            contestId
          }
        },
        select: { role: true }
      })
    ])

    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
    if (!contestRecord) {
      throw new EntityNotExistException('ContestRecord')
    }
    if (
      !requesterRole ||
      (requesterRole.role !== ContestRole.Admin &&
        requesterRole.role !== ContestRole.Manager)
    ) {
      throw new ForbiddenAccessException(
        'Only Admin or Manager can remove users from contest'
      )
    }

    const now = new Date()
    if (now >= contest.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended contest'
      )
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.contestRecord.delete({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: { contestId, userId }
        }
      })

      return tx.userContest.delete({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { userId_contestId: { userId, contestId } }
      })
    })
  }

  /**
   * 특정 사용자의 대회 제출 목록과 점수 요약을 조회합니다.
   *
   * @param {number} take 페이지당 가져올 제출 수
   * @param {number} contestId 대회 ID
   * @param {number} userId 사용자 ID
   * @param {number | null} problemId 특정 문제 제출만 필터링
   * @param {number | null} cursor 페이지네이션 커서
   * @returns 'scoreSummary'와 'submissions' 배열 객체
   */
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

    const problemFilter = problemId ? { problemId } : {}
    const [submissions, scoreSummary] = await Promise.all([
      this.prisma.submission.findMany({
        ...paginator,
        take,
        where: {
          userId,
          contestId,
          ...problemFilter
        },
        include: {
          problem: {
            select: {
              title: true,
              contestProblem: {
                where: {
                  contestId,
                  ...problemFilter
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
      }),
      this.getContestScoreSummary(userId, contestId)
    ])

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

    return {
      scoreSummary,
      submissions: mappedSubmission
    }
  }

  /**
   * (private) 특정 User의 특정 Contest에 대한 점수 요약을 계산합니다.
   * 총점, 문제별 점수, 제출한 문제 수 등을 반환합니다.
   *
   * @param {number} userId 사용자 ID
   * @param {number} contestId 대회 ID
   * @returns 점수 요약
   */
  private async getContestScoreSummary(userId: number, contestId: number) {
    const [contestProblems, rawSubmissions] = await Promise.all([
      this.prisma.contestProblem.findMany({
        where: {
          contestId
        },
        select: { problemId: true, score: true }
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

    // 현재 Contest에 남아있는 문제들의 제출에 대해서만 ScoreSummary 계산
    const contestProblemScoreMap = new Map(
      contestProblems.map((cp) => [cp.problemId, cp.score])
    )
    const submissions = rawSubmissions.filter((submission) =>
      contestProblemScoreMap.has(submission.problemId)
    )
    const contestPerfectScore = contestProblems.reduce(
      (total, { score }) => total + score,
      0
    )

    if (!submissions.length) {
      return {
        submittedProblemCount: 0,
        totalProblemCount: contestProblems.length,
        userContestScore: 0,
        contestPerfectScore,
        problemScores: []
      }
    }

    // 하나의 Problem에 대해 여러 개의 Submission이 존재한다면, 마지막에 제출된 Submission만을 점수 계산에 반영함
    const latestSubmissions = this.buildLatestSubmissionsMap(
      submissions,
      contestProblemScoreMap
    )

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
      contestPerfectScore, // Contest의 만점
      problemScores // 개별 Problem의 점수 리스트 (각 문제에서 몇 점을 획득했는지)
    }

    return scoreSummary
  }

  /**
   * (private) 제출 목록과 문제 배점표 기반으로, 문제 ID별 최신 제출 점수를 반환합니다.
   *
   * @param {Submission[]} submissions 사용자 제출 목록
   * @param {Map<number, number>} contestProblemScoreMap <problemId, maxScore> 배점 맵
   * @returns 문제 ID별 최신 제출 점수
   */
  private buildLatestSubmissionsMap(
    submissions: Submission[],
    contestProblemScoreMap: Map<number, number>
  ) {
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

      const maxScore = contestProblemScoreMap.get(problemId)
      if (maxScore === undefined) continue

      latestSubmissions[problemId] = {
        result: submission.result as ResultStatus,
        score: new Prisma.Decimal(submission.score)
          .mul(maxScore)
          .div(100)
          .trunc()
          .toNumber(),
        maxScore
      }
    }

    return latestSubmissions
  }

  /**
   * 특정 대회의 참가자별 점수 요약 목록을 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number} take 페이지당 가져올 참가자 수
   * @param {number | null} cursor 페이지네이션 커서
   * @param {string} [searchingName] 참가자의 'realName'으로 검색
   * @returns 각 참가자 정보와 점수 요약
   */
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

    const [contestRecords, contestProblems] = await Promise.all([
      this.prisma.contestRecord.findMany({
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
                    mode: Prisma.QueryMode.insensitive as Prisma.QueryMode
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
      }),
      this.prisma.contestProblem.findMany({
        where: { contestId },
        select: { problemId: true, score: true }
      })
    ])

    if (!contestRecords.length) {
      return []
    }

    const userIds = contestRecords.map((record) => record.userId as number)

    // 모든 사용자의 제출 기록
    const rawSubmissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        userId: { in: userIds }
      },
      orderBy: { createTime: 'desc' }
    })

    // get contest score summary
    const problemScoreMap = new Map(
      contestProblems.map((p) => [p.problemId, p.score])
    )
    const contestPerfectScore = contestProblems.reduce(
      (total, { score }) => total + score,
      0
    )

    // 제출 기록을 사용자 ID별로 그룹화
    const submissionsByUserId = new Map<number, Submission[]>()
    for (const submission of rawSubmissions) {
      if (!submissionsByUserId.has(submission.userId!)) {
        submissionsByUserId.set(submission.userId!, [])
      }
      submissionsByUserId.get(submission.userId!)!.push(submission)
    }

    const contestRecordsWithScoreSummary = contestRecords.map((record) => {
      const userId = record.userId as number
      const userSubmissions = submissionsByUserId.get(userId) ?? []

      const submissions = userSubmissions.filter((submission) =>
        problemScoreMap.has(submission.problemId)
      )

      let scoreSummary
      if (!submissions.length) {
        scoreSummary = {
          submittedProblemCount: 0,
          totalProblemCount: contestProblems.length,
          userContestScore: 0,
          contestPerfectScore,
          problemScores: []
        }
      } else {
        const latestSubmissions = this.buildLatestSubmissionsMap(
          submissions,
          problemScoreMap
        )
        const problemScores = Object.entries(latestSubmissions).map(
          ([problemId, data]) => ({
            problemId: parseInt(problemId),
            score: data.score,
            maxScore: data.maxScore
          })
        )
        scoreSummary = {
          submittedProblemCount: Object.keys(latestSubmissions).length,
          totalProblemCount: contestProblems.length,
          userContestScore: problemScores.reduce(
            (total, { score }) => total + score,
            0
          ),
          contestPerfectScore,
          problemScores
        }
      }

      return {
        userId: record.userId,
        username: record.user?.username,
        studentId: record.user?.studentId,
        realName: record.user?.userProfile?.realName,
        major: record.user?.major,
        ...scoreSummary
      }
    })

    return contestRecordsWithScoreSummary
  }

  /**
   * 특정 문제가 포함된 모든 대회의 목록을 'upcoming', 'ongoing', 'finished'로 그룹화하여 조회합니다.
   *
   * @param {number} problemId 문제 ID
   * @returns 'upcoming', 'ongoing', 'finished'로 구분한 대회 리스트
   */
  async getContestsByProblemId(problemId: number) {
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: {
        problemId
      },
      select: {
        score: true,
        contest: {
          include: {
            contestProblem: {
              select: {
                score: true
              }
            }
          }
        }
      }
    })

    const contests = contestProblems.map((cp) => {
      const { contest, score } = cp
      const totalScore = contest.contestProblem.reduce(
        (total, problem) => total + problem.score,
        0
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { contestProblem, ...contestData } = contest

      return {
        ...contestData,
        problemScore: score, // 문제의 배점
        totalScore // 대회의 총점
      }
    })

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

  /**
   * 대회의 리더보드 전체 데이터를 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {string} [search] 사용자 이름(username)으로 필터링
   * @returns 대회 리더보드 데이터
   */
  async getContestLeaderboard(contestId: number, search?: string) {
    const [
      contest,
      participatedResult,
      registeredNum,
      sum,
      contestRecords,
      submissionCounts,
      allProblems
    ] = await Promise.all([
      this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { id: true, freezeTime: true, unfreeze: true }
      }),
      this.prisma.submission.groupBy({
        by: ['userId'],
        where: { contestId }
      }),
      this.prisma.contestRecord.count({
        where: { contestId }
      }),
      // Contest의 최고 점수 계산
      this.prisma.contestProblem.aggregate({
        where: { contestId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _sum: { score: true }
      }),
      // 항상 finalScore, finalTotalPenalty 사용
      this.prisma.contestRecord.findMany({
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

    const participatedNum = participatedResult.length
    const maxScore = sum._sum?.score ?? 0
    const isFrozen =
      contest.freezeTime != null &&
      new Date() >= contest.freezeTime &&
      !contest.unfreeze

    // 제출 횟수 매핑
    const submissionCountMap: Record<number, Record<number, number>> = {}
    for (const { userId, problemId, _count } of submissionCounts) {
      if (userId == null || problemId == null || _count?.id == null) continue
      if (!submissionCountMap[userId]) {
        submissionCountMap[userId] = {}
      }
      submissionCountMap[userId][problemId] = _count.id
    }

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

  /**
   * 대회 기간 중에 발생한 문제 수정 내역을 조회합니다.
   *
   * @param {number} contestId 대회 ID
   * @returns 'updateHistories'
   */
  async getContestUpdateHistories(contestId: number) {
    const [contest, contestProblems] = await Promise.all([
      this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { id: true, startTime: true, endTime: true }
      }),
      this.prisma.contestProblem.findMany({
        where: { contestId },
        select: { problemId: true, order: true }
      })
    ])

    const contestUpdateHistories = await this.prisma.updateHistory.findMany({
      where: {
        problemId: {
          in: contestProblems.map((problem) => problem.problemId)
        },
        updatedAt: {
          gte: contest.startTime,
          lte: contest.endTime
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // problemId를 order를 매핑
    const problemIdToOrderMap = new Map(
      contestProblems.map((p) => [p.problemId, p.order])
    )

    return {
      updateHistories: contestUpdateHistories.map((history) => ({
        ...history,
        order: problemIdToOrderMap.get(history.problemId) ?? null
      }))
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
   * 특정 대회의 참가자 목록을 불러옵니다. (Contest Management - Participants용)
   * @param contestId 조회할 대회의 Id
   * @returns isBlock가 포함된 참가자 목록
   */
  async getContestParticipants(contestId: number) {
    const participants = await this.prisma.userContest.findMany({
      where: {
        contestId,
        role: ContestRole.Participant
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            major: true,
            email: true
          }
        },
        isBlocked: true
      }
    })

    return participants
      .filter((participant) => participant.user != null)
      .map(({ user, isBlocked }) => ({
        id: user!.id,
        username: user!.username,
        major: user!.major,
        email: user!.email,
        isBlocked
      }))
  }
}
