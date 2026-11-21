import { Injectable } from '@nestjs/common'
import type { WorkbookProblem } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookProblemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets the problems of a workbook in a group.
   *
   * @param {number} groupId Group ID
   * @param {number} workbookId Workbook ID
   * @returns The workbookProblems in the workbook
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 if the group with groupId has no workbook with workbookId
   */
  async getWorkbookProblems(
    groupId: number,
    workbookId: number
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    // 아니면 에러 throw
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    const workbookProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId }
    })

    return workbookProblems
  }

  /**
   * Changes the order of the problems in a workbook.
   * Each problem's new order is the position of its problemId in orders (index + 1).
   *
   * @param {number} groupId Group ID
   * @param {number} workbookId Workbook ID
   * @param {number[]} orders problemIds in the new order (must include every problem in the workbook)
   * @returns The reordered workbookProblems
   * @throws {Prisma.PrismaClientKnownRequestError} Thrown with code P2025 if the group with groupId has no workbook with workbookId
   * @throws {UnprocessableDataException} If the length of orders differs from the number of problems in the workbook
   */
  async updateWorkbookProblemsOrder(
    groupId: number,
    workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    orders: number[]
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    // workbookId를 가지고 있는 workbookProblem을 모두 가져옴
    const workbookProblemsToBeUpdated =
      await this.prisma.workbookProblem.findMany({
        where: { workbookId }
      })
    // orders 길이와  찾은 workbookProblem 길이가 같은지 확인
    if (orders.length !== workbookProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'The len of orders and the len of workbookProblem are not equal.'
      )
    }
    //problemId 기준으로 오름차순 정렬
    workbookProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const queries = workbookProblemsToBeUpdated.map((record) => {
      const newOrder = orders.indexOf(record.problemId) + 1
      return this.prisma.workbookProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          workbookId_problemId: {
            workbookId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })
    return await this.prisma.$transaction(queries)
  }
}
