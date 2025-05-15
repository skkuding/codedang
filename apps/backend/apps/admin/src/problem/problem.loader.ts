import { Injectable, Scope } from '@nestjs/common'
import type { Problem } from '@prisma/client'
import DataLoader from 'dataloader'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable({ scope: Scope.REQUEST })
export class ProblemLoader {
  constructor(private readonly prisma: PrismaService) {}

  batchProblems = new DataLoader<number, Problem>(async (ids: number[]) => {
    const problems = await this.prisma.problem.findMany({
      where: { id: { in: ids } }
    })

    const problemMap = new Map(problems.map((problem) => [problem.id, problem]))
    return ids.map((id) => {
      const problem = problemMap.get(id)
      return problem ?? new EntityNotExistException('Problem')
    })
  })
}
