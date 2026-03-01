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

  /**
   * 특정 대회의 문제 리스트를 조회합니다.
   *
   * @param {number} contestId 대회 아이디
   * @returns {ContestProblem[]} 문제 리스트 반환
   */
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
   * @throws {EntityNotExistException} error.code === 'P2003'일때 에러 발생 (FK에 존재하지 않는 부모 엔티티 ID가 있을때)
   * @throws {UnprocessableDataException} service 레벨에서 처리 불가능한 에러 throw
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
   * @throws {EntityNotExistException}
   * 1. ID로 조회시 대회가 존재하지 않을때
   * 2. 요청한 ConstestProblem 엔티티가 존재하지 않을때
   * @throws {UnprocessableDataException} service 레벨에서 처리 불가능한 에러 throw
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

  /**
   * 특정 대회에서 문제들의 점수를 업데이트 합니다.
   *
   * @param {number} contestId 대회 아이디
   * @param {ProblemScoreInput[]} problemIdsWithScore 문제별 점수의 배열
   * @returns {Partial<ContestProblem>[]} 점수가 업데이트 된 문제들의 배열을 반환합니다.
   */
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

  /**
   * 특정 대회의 문제들을 원하는 순서로 정렬(업데이트) 합니다.
   *
   * @param {number} contestId 대회 아이디
   * @param {number[]} orders problemId 배열로 나타낸 순서
   * @throws {UnprocessableDataException}
   * 1. orders 배열의 길이가 problem 개수와 일치하지 않을때
   * 2. orders 배열에 빼먹은 problem이 있을때
   * @returns {Partial<ContestProblem[]>} 순서가 반영된 대회 문제 배열
   */
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
