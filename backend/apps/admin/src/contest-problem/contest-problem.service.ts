import { Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ContestProblem } from '@admin/@generated'

@Injectable()
export class ContestProblemService {
  constructor(private readonly prisma: PrismaService) {}
  async getContestProblems(
    contestId: number
  ): Promise<Partial<ContestProblem>[]> {
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    if (contestProblems.length <= 0) {
      throw new PrismaClientKnownRequestError('records NotFound', {
        code: 'P2025',
        meta: { target: ['contestproblem'] },
        clientVersion: '5.1.1'
      })
    }
    return contestProblems
  }

  async updateContestProblemsOrder(
    contestId,
    orders
  ): Promise<Partial<ContestProblem>[]> {
    const contestProblemsToBeUpdated =
      await this.prisma.contestProblem.findMany({
        where: { contestId }
      })

    if (contestProblemsToBeUpdated.length <= 0) {
      throw new PrismaClientKnownRequestError('records NotFound', {
        code: 'P2025',
        meta: { target: ['ContestProblem'] },
        clientVersion: '5.1.1'
      })
    }
    if (orders.length <= 0) {
      throw new UnprocessableDataException('the len of orders is lt 0')
    }
    if (orders.length !== contestProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'the len of orders and the len of contestProblem are not equal!'
      )
    }
    //problemId 기준으로 오름차순 정렬
    contestProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const promisesToBeResolved = contestProblemsToBeUpdated.map(
      async (record, idx) => {
        const newOrder = orders[idx]
        return await this.prisma.contestProblem.update({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_problemId: {
              contestId: contestId,
              problemId: record.problemId
            }
          },
          data: { order: newOrder }
        })
      }
    )
    return await Promise.all(promisesToBeResolved)
  }
}
