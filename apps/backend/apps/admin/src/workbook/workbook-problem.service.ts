import { Injectable } from '@nestjs/common'
import type { WorkbookProblem } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class WorkbookProblemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 그룹에 속한 문제집의 문제 목록을 조회합니다.
   *
   * @param {number} groupId 그룹 ID
   * @param {number} workbookId 문제집 ID
   * @returns 문제집에 포함된 workbookProblem 목록
   * @throws {NotFoundException} groupId 그룹에 workbookId에 해당하는 문제집이 없는 경우 발생합니다.
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
   * 문제집에 포함된 문제들의 순서를 변경합니다.
   * orders에 나열된 problemId의 위치(인덱스 + 1)가 각 문제의 새로운 순서가 됩니다.
   *
   * @param {number} groupId 그룹 ID
   * @param {number} workbookId 문제집 ID
   * @param {number[]} orders 변경할 순서대로 나열한 problemId 목록 (문제집의 모든 문제를 포함해야 함)
   * @returns 순서가 변경된 workbookProblem 목록
   * @throws {NotFoundException} groupId 그룹에 workbookId에 해당하는 문제집이 없는 경우 발생합니다.
   * @throws {UnprocessableDataException} orders의 길이가 문제집의 문제 수와 다른 경우 발생합니다.
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
