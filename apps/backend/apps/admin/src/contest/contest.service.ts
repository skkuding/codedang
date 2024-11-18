import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common'
import { Contest, ResultStatus, Submission } from '@generated'
import type { ContestProblem } from '@prisma/client'
import { Cache } from 'cache-manager'
import {
  OPEN_SPACE_ID,
  PUBLICIZING_REQUEST_EXPIRE_TIME,
  PUBLICIZING_REQUEST_KEY,
  MIN_DATE,
  MAX_DATE
} from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateContestInput } from './model/contest.input'
import type { UpdateContestInput } from './model/contest.input'
import type { ProblemScoreInput } from './model/problem-score.input'
import type { PublicizingRequest } from './model/publicizing-request.model'
import type { PublicizingResponse } from './model/publicizing-response.output'

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getContests(take: number, groupId: number, cursor: number | null) {
    const paginator = this.prisma.getPaginator(cursor)

    const contests = await this.prisma.contest.findMany({
      ...paginator,
      where: { groupId },
      take,
      include: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { contestRecord: true }
        }
      }
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
        }
      }
    })

    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    const { _count, ...data } = contest

    return {
      ...data,
      participants: _count.contestRecord
    }
  }

  async createContest(
    groupId: number,
    userId: number,
    contest: CreateContestInput
  ): Promise<Contest> {
    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }

    try {
      return await this.prisma.contest.create({
        data: {
          createdById: userId,
          groupId,
          ...contest
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async updateContest(
    groupId: number,
    contest: UpdateContestInput
  ): Promise<Contest> {
    const contestFound = await this.prisma.contest.findFirst({
      where: {
        id: contest.id,
        groupId
      },
      select: {
        startTime: true,
        endTime: true,
        contestProblem: {
          select: {
            problemId: true
          }
        }
      }
    })
    if (!contestFound) {
      throw new EntityNotExistException('contest')
    }
    const isEndTimeChanged =
      contest.endTime && contest.endTime !== contestFound.endTime
    contest.startTime = contest.startTime || contestFound.startTime
    contest.endTime = contest.endTime || contestFound.endTime
    if (contest.startTime >= contest.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const problemIds = contestFound.contestProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length && isEndTimeChanged) {
      for (const problemId of problemIds) {
        try {
          // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정
          let visibleLockTime = contest.endTime

          const contestIds = (
            await this.prisma.contestProblem.findMany({
              where: {
                problemId
              }
            })
          )
            .filter((contestProblem) => contestProblem.contestId !== contest.id)
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
        } catch {
          continue
        }
      }
    }

    try {
      return await this.prisma.contest.update({
        where: {
          id: contest.id
        },
        data: {
          title: contest.title,
          ...contest
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async deleteContest(groupId: number, contestId: number) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId
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
      throw new EntityNotExistException('contest')
    }

    const problemIds = contest.contestProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length) {
      await this.removeProblemsFromContest(groupId, contestId, problemIds)
    }

    try {
      return await this.prisma.contest.delete({
        where: {
          id: contestId
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async getPublicizingRequests() {
    const requests = await this.cacheManager.get<PublicizingRequest[]>(
      PUBLICIZING_REQUEST_KEY
    )

    if (!requests) {
      return []
    }

    const filteredRequests = requests.filter(
      (req) => new Date(req.expireTime) > new Date()
    )

    if (requests.length != filteredRequests.length) {
      await this.cacheManager.set(
        PUBLICIZING_REQUEST_KEY,
        filteredRequests,
        PUBLICIZING_REQUEST_EXPIRE_TIME
      )
    }

    return filteredRequests
  }

  async handlePublicizingRequest(contestId: number, isAccepted: boolean) {
    const requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<PublicizingRequest>
    if (!requests) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }

    const request = requests.find((req) => req.contestId === contestId)
    if (!request || new Date(request.expireTime) < new Date()) {
      throw new EntityNotExistException('ContestPublicizingRequest')
    }

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests.filter((req) => req.contestId != contestId),
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    if (isAccepted) {
      try {
        await this.prisma.contest.update({
          where: {
            id: contestId
          },
          data: {
            groupId: OPEN_SPACE_ID
          }
        })
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return {
      contestId,
      isAccepted
    } as PublicizingResponse
  }

  async createPublicizingRequest(groupId: number, contestId: number) {
    if (groupId == OPEN_SPACE_ID) {
      throw new UnprocessableEntityException(
        'This contest is already publicized'
      )
    }

    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        groupId
      }
    })
    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    let requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<PublicizingRequest>
    if (!requests) {
      requests = []
    }

    const duplicatedRequest = requests.find((req) => req.contestId == contestId)
    if (duplicatedRequest) {
      throw new ConflictFoundException('duplicated publicizing request')
    }

    const newRequest: PublicizingRequest = {
      contestId,
      userId: contest.createdById!, // TODO: createdById가 null일 경우 예외처리
      expireTime: new Date(Date.now() + PUBLICIZING_REQUEST_EXPIRE_TIME)
    }
    requests.push(newRequest)

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests,
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    return newRequest
  }

  async importProblemsToContest(
    groupId: number,
    contestId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId,
        groupId
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
      throw new EntityNotExistException('contest')
    }
    if (contest.submission.length) {
      throw new UnprocessableDataException(
        'Cannot import problems if submission exists'
      )
    }

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
              // 원래 id: 'temp'이었는데, contestProblem db schema field가 바뀌어서
              // 임시 방편으로 order: 0으로 설정합니다.
              order: 0,
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

  async removeProblemsFromContest(
    groupId: number,
    contestId: number,
    problemIds: number[]
  ) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId,
        groupId
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
      throw new EntityNotExistException('contest')
    }
    if (contest.submission.length) {
      throw new UnprocessableDataException(
        'Cannot delete problems if submission exists'
      )
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
          throw new EntityNotExistException('contest')
        }

        visibleLockTime = latestContest.endTime
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
          })
        ])

        contestProblems.push(contestProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return contestProblems
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
   * Duplicate contest with contest problems and users who participated in the contest
   * Not copied: submission
   * @param groupId group to duplicate contest
   * @param contestId contest to duplicate
   * @param userId user who tries to duplicates the contest
   * @returns
   */
  async duplicateContest(groupId: number, contestId: number, userId: number) {
    const [contestFound, contestProblemsFound, userContestRecords] =
      await Promise.all([
        this.prisma.contest.findFirst({
          where: {
            id: contestId,
            groupId
          }
        }),
        this.prisma.contestProblem.findMany({
          where: {
            contestId
          }
        }),
        this.prisma.contestRecord.findMany({
          where: {
            contestId
          }
        })
      ])

    if (!contestFound) {
      throw new EntityNotExistException('contest')
    }

    // if contest status is ongoing, visible would be true. else, false
    const now = new Date()
    let newVisible = false
    if (contestFound.startTime <= now && now <= contestFound.endTime) {
      newVisible = true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createTime, updateTime, title, ...contestDataToCopy } =
      contestFound

    try {
      const [newContest, newContestProblems, newContestRecords] =
        await this.prisma.$transaction(async (tx) => {
          // 1. copy contest
          const newContest = await tx.contest.create({
            data: {
              ...contestDataToCopy,
              title: 'Copy of ' + title,
              createdById: userId,
              groupId,
              isVisible: newVisible
            }
          })

          // 2. copy contest problems
          const newContestProblems = await Promise.all(
            contestProblemsFound.map((contestProblem) =>
              tx.contestProblem.create({
                data: {
                  order: contestProblem.order,
                  contestId: newContest.id,
                  problemId: contestProblem.problemId
                }
              })
            )
          )

          // 3. copy contest records (users who participated in the contest)
          const newContestRecords = await Promise.all(
            userContestRecords.map((userContestRecord) =>
              tx.contestRecord.create({
                data: {
                  contestId: newContest.id,
                  userId: userContestRecord.userId
                }
              })
            )
          )

          return [newContest, newContestProblems, newContestRecords]
        })

      return {
        contest: newContest,
        problems: newContestProblems,
        records: newContestRecords
      }
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  /**
   * 특정 user의 특정 Contest에 대한 총점, 통과한 문제 개수와 각 문제별 테스트케이스 통과 개수를 불러옵니다.
   */
  async getContestScoreSummary(userId: number, contestId: number) {
    const [contestProblems, submissions] = await Promise.all([
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
        throw new EntityNotExistException('contestProblem')
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
            }
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
        contest: true
      }
    })

    if (!contestProblems.length) {
      throw new EntityNotExistException('Problem or ContestProblem')
    }

    const contests = contestProblems.map(
      (contestProblem) => contestProblem.contest
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
        upcoming: [] as Contest[],
        ongoing: [] as Contest[],
        finished: [] as Contest[]
      }
    )

    return contestsGroupedByStatus
  }
}
