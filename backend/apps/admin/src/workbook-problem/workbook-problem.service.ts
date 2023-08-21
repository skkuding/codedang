import { Injectable } from '@nestjs/common'
import type { WorkbookProblem } from '@generated'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookProblemService {
  constructor(private readonly prisma: PrismaService) {}
  async getWorkbookProblems(
    workbookId: number
  ): Promise<Partial<WorkbookProblem>[]> {
    const workbookProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId }
    })
    if (workbookProblems.length <= 0) {
      throw new PrismaClientKnownRequestError('records NotFound', {
        code: 'P2025',
        meta: { target: ['workbookproblem'] },
        clientVersion: '5.1.1'
      })
    }
    return workbookProblems
  }
  async updateWorkbookProblemsOrder(
    workbookId,
    orders
  ): Promise<Partial<WorkbookProblem>[]> {
    const workbookProblemsToBeUpdated =
      await this.prisma.workbookProblem.findMany({
        where: { workbookId }
      })

    if (workbookProblemsToBeUpdated.length <= 0) {
      throw new PrismaClientKnownRequestError('records NotFound', {
        code: 'P2025',
        meta: { target: ['workbookproblem'] },
        clientVersion: '5.1.1'
      })
    }
    if (orders.length <= 0) {
      throw new UnprocessableDataException('the len of orders is lt 0')
    }
    if (orders.length !== workbookProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'the len of orders and the len of workbookProblem are not equal!'
      )
    }
    //problemId 기준으로 오름차순 정렬
    workbookProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const promisesToBeResolved = workbookProblemsToBeUpdated.map(
      (record, idx) => {
        const newOrder = orders[idx]
        return this.prisma.workbookProblem.update({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            workbookId_problemId: {
              workbookId: workbookId,
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
