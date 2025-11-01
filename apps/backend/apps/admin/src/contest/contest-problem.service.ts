import { Injectable } from '@nestjs/common'
import { Prisma, type ContestProblem } from '@prisma/client'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemScoreInput } from './model/problem-score.input'

@Injectable()
export class ContestProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getContestProblems(
    contestId: number
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
    })
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    return contestProblems
  }

  /**
   * 대회에 여러 문제를 일괄적으로 추가합니다.
   * 이미 추가된 문제는 건너뛰며, 'visibleLockTime'를 업데이트합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {ProblemScoreInput[]} problemIdsWithScore 추가할 문제 ID와 배점
   * @returns 'ContestProblem' 정보
   */
  async importProblemsToContest(
    contestId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    const [contest, maxOrderResult, existingProblems] = await Promise.all([
      this.prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { endTime: true }
      }),
      this.prisma.contestProblem.aggregate({
        where: { contestId },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      }),
      this.prisma.contestProblem.findMany({
        where: { contestId },
        select: { problemId: true }
      })
    ])

    let maxOrder = maxOrderResult._max?.order ?? -1
    const existingProblemIds = new Set(existingProblems.map((p) => p.problemId))

    const contestProblems: ContestProblem[] = []

    for (const { problemId, score } of problemIdsWithScore) {
      if (existingProblemIds.has(problemId)) {
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
                { visibleLockTime: { equals: MIN_DATE } },
                { visibleLockTime: { equals: MAX_DATE } },
                { visibleLockTime: { lte: contest.endTime } }
              ]
            },
            data: {
              visibleLockTime: contest.endTime
            }
          })
        ])
        contestProblems.push(contestProblem)
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new EntityNotExistException(`Problem ${problemId}`)
          }
        }
        throw new UnprocessableDataException((error as Error).message)
      }
    }

    return contestProblems
  }

  /**
   * 대회에서 특정 문제들을 제거합니다.
   *
   * @param {number} contestId 대회 ID
   * @param {number[]} problemIds 제거할 문제 ID 배열
   * @returns 삭제된 `ContestProblem` 정보
   */
  async removeProblemsFromContest(contestId: number, problemIds: number[]) {
    const contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      select: { endTime: true }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    const contestProblems: ContestProblem[] = []

    for (const problemId of problemIds) {
      const [otherContestIds, removeContestProblem] = await Promise.all([
        this.prisma.contestProblem
          .findMany({
            where: {
              problemId,
              contestId: { not: contestId }
            },
            select: { contestId: true }
          })
          .then((cps) => cps.map((cp) => cp.contestId)),

        this.prisma.contestProblem.findUniqueOrThrow({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_problemId: {
              contestId,
              problemId
            }
          },
          select: { order: true }
        })
      ])

      // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정 (없을시 비공개 전환)
      let visibleLockTime = MAX_DATE

      if (otherContestIds.length) {
        const latestContest = await this.prisma.contest.findFirst({
          where: {
            id: { in: otherContestIds }
          },
          orderBy: { endTime: 'desc' },
          select: { endTime: true }
        })
        visibleLockTime = latestContest!.endTime
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new EntityNotExistException('ContestProblem')
          }
        }
        throw new UnprocessableDataException((error as Error).message)
      }
    }

    return contestProblems
  }

  async updateContestProblemsScore(
    contestId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
    })

    const queries = problemIdsWithScore.map((record) => {
      return this.prisma.contestProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId: record.problemId
          }
        },
        data: { score: record.score }
      })
    })

    return await this.prisma.$transaction(queries)
  }

  async updateContestProblemsOrder(
    contestId: number,
    orders: number[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
    })

    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })

    if (orders.length !== contestProblems.length) {
      throw new UnprocessableDataException(
        'The length of orders and the length of contestProblem are not equal.'
      )
    }

    const queries = contestProblems.map((record) => {
      const newOrder = orders.indexOf(record.problemId)
      if (newOrder === -1) {
        throw new UnprocessableDataException(
          'There is a problemId in the contest that is missing from the provided orders.'
        )
      }
      return this.prisma.contestProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })

    return await this.prisma.$transaction(queries)
  }
}
