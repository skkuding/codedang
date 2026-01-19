import { Injectable } from '@nestjs/common'
import type { AssignmentProblem } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { AssignmentProblemUpdateInput } from './model/assignment-problem.input'

@Injectable()
export class AssignmentProblemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 그룹의 과제에 속한 문제 목록을 조회합니다.
   *
   * @param {number} groupId 그룹 ID
   * @param {number} assignmentId 과제 ID
   * @returns 해당 과제에 연결된 문제(AssignmentProblem) 리스트
   * @throws 과제가 존재하지 않거나 해당 그룹에 속하지 않는 경우 에러 발생
   */
  async getAssignmentProblems(groupId: number, assignmentId: number) {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })
    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId }
    })
    return assignmentProblems
  }

  /**
   * 과제에 연결된 문제들의 설정(배점 및 정답 공개 시간)을 일괄 수정합니다.
   *
   * @param {number} groupId 그룹 ID
   * @param {numbser} assignmentId 과제 ID
   * @param {AssignmentProblemUpdateInput[]} assignmentProblemUpdateInput 업데이트할 문제 설정 목록
   * @returns 업데이트된 문제(AssignmentProblem) 리스트
   * @throws 과제가 존재하지 않거나 해당 그룹에 속하지 않는 경우 에러 발생
   */
  async updateAssignmentProblems(
    groupId: number,
    assignmentId: number,
    assignmentProblemUpdateInput: AssignmentProblemUpdateInput[]
  ) {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })

    const queries = assignmentProblemUpdateInput.map((record) => {
      return this.prisma.assignmentProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId,
            problemId: record.problemId
          }
        },
        data: {
          score: record.score,
          solutionReleaseTime: record.solutionReleaseTime
        }
      })
    })

    return this.prisma.$transaction(queries)
  }

  /**
   * 과제에 연결된 문제들의 순서를 변경합니다.
   * 전달받은 `orders` 배열의 인덱스 순서대로 `order` 필드 값을 0부터 재할당합니다.
   *
   * @param {number} groupId 그룹 ID
   * @param {number} assignmentId 과제 ID
   * @param {number[]} orders 문제 ID로 구성된 배열
   * @returns 업데이트된 문제(AssignmentProblem) 리스트
   * @throws 과제가 존재하지 않거나 해당 그룹에 속하지 않는 경우 에러 발생
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * - 과제의 문제 목록 길이와 `orders` 배열의 길이가 다를 때
   * - 과제에 포함된 문제가 `orders` 배열에서 누락된 경우
   */
  async updateAssignmentProblemsOrder(
    groupId: number,
    assignmentId: number,
    orders: number[]
  ) {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId }
    })

    if (orders.length !== assignmentProblems.length) {
      throw new UnprocessableDataException(
        'the length of orders and the length of assignmentProblem are not equal.'
      )
    }

    const queries = assignmentProblems.map((record) => {
      const newOrder = orders.indexOf(record.problemId)
      if (newOrder === -1) {
        throw new UnprocessableDataException(
          'There is a problemId in the assignment that is missing from the provided orders.'
        )
      }

      return this.prisma.assignmentProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })

    return this.prisma.$transaction(queries)
  }
}
