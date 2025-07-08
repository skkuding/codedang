import { Injectable } from '@nestjs/common'
import type { ContestProblem } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
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
