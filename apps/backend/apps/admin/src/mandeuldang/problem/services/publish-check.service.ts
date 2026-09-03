import { Injectable } from '@nestjs/common'
import type { Prisma, Problem } from '@prisma/client'
import { PrismaService } from '@libs/prisma'

type Client = PrismaService | Prisma.TransactionClient

const REQUIRED_STATEMENT_FIELDS = [
  'title',
  'description',
  'inputDescription',
  'outputDescription',
  'hint',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'source'
] satisfies (keyof Problem)[]

@Injectable()
export class PublishCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async check(problemId: number, client: Client = this.prisma) {
    const problem = await client.problem.findUniqueOrThrow({
      where: { id: problemId },
      include: {
        mandeuldangSolution: true,
        problemTestcase: { select: { id: true } }
      }
    })

    const missing: string[] = []

    const statementComplete =
      REQUIRED_STATEMENT_FIELDS.every(
        (field) => problem[field] !== null && problem[field] !== ''
      ) && problem.languages.length > 0
    if (!statementComplete) missing.push('STATEMENT')

    if (!problem.mandeuldangSolution) missing.push('SOLUTION')

    if (problem.problemTestcase.length === 0) missing.push('TEST_FILES')

    return { canPublish: missing.length === 0, missing }
  }
}
