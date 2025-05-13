import { Injectable } from '@nestjs/common'
import type { AssignmentProblem } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemScoreInput } from '@admin/contest/model/problem-score.input'

@Injectable()
export class AssignmentProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignmentProblems(
    groupId: number,
    assignmentId: number
  ): Promise<Partial<AssignmentProblem>[]> {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })
    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId }
    })
    return assignmentProblems
  }

  async updateAssignmentProblemsScore(
    groupId: number,
    assignmentId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ): Promise<Partial<AssignmentProblem>[]> {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })

    const queries = problemIdsWithScore.map((record) => {
      return this.prisma.assignmentProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId,
            problemId: record.problemId
          }
        },
        data: { score: record.score }
      })
    })

    return await this.prisma.$transaction(queries)
  }

  async updateAssignmentProblemsOrder(
    groupId: number,
    assignmentId: number,
    orders: number[]
  ): Promise<Partial<AssignmentProblem>[]> {
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

    return await this.prisma.$transaction(queries)
  }
}
