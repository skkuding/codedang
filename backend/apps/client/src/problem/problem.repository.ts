import { Injectable } from '@nestjs/common'
import type { Problem, WorkbookProblem } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

/**
 * repository에서는 partial entity를 반환합니다.
 * 반환된 data를 service에서 class-transformer를 사용하여 ResponseDto로 변환합니다
 *
 * repository는 ORM 쿼리를 위한 layer입니다. unit test에서는 제외하고, 통합 테스트(e2e test)에서 실제 반환값과 ResponseDto가 일치하는지 비교를 통해 검증합니다
 * https://softwareengineering.stackexchange.com/questions/185326/why-do-i-need-unit-tests-for-testing-repository-methods
 *
 */

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly problemsSelectOption = {
    id: true,
    title: true,
    difficulty: true
  }

  private readonly problemSelectOption = {
    ...this.problemsSelectOption,
    description: true,
    inputDescription: true,
    outputDescription: true,
    hint: true,
    languages: true,
    timeLimit: true,
    memoryLimit: true,
    source: true,
    inputExamples: true,
    outputExamples: true
  }

  private readonly relatedProblemSelectOption = {
    id: true,
    problem: {
      select: this.problemSelectOption
    }
  }

  private readonly relatedProblemsSelectOption = {
    id: true,
    problem: {
      select: this.problemsSelectOption
    }
  }

  async getProblems(cursor: number, take: number): Promise<Partial<Problem>[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.problem.findMany({
      cursor: {
        id: cursor
      },
      skip: skip,
      take: take,
      where: {
        groupId: OPEN_SPACE_ID
      },
      select: {
        ...this.problemsSelectOption
      }
    })
  }

  async getProblem(
    problemId: number,
    groupId: number
  ): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        groupId: groupId
      },
      select: this.problemSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getContestProblems(contestId: number, cursor: number, take: number) {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.contestProblem.findMany({
      cursor: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId: contestId,
          problemId: cursor
        }
      },
      skip: skip,
      take: take,
      where: { contestId: contestId },
      select: {
        ...this.relatedProblemsSelectOption,
        contest: {
          select: {
            startTime: true
          }
        }
      }
    })
  }

  async getContestProblem(contestId: number, problemId: number) {
    return await this.prisma.contestProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          contestId: contestId,
          problemId: problemId
        }
      },
      select: {
        ...this.relatedProblemSelectOption,
        contest: {
          select: {
            startTime: true
          }
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getWorkbookProblems(
    workbookId: number,
    cursor: number,
    take: number
  ): Promise<(Partial<WorkbookProblem> & { problem: Partial<Problem> })[]> {
    let skip = 1
    if (cursor === 0) {
      cursor = 1
      skip = 0
    }
    return await this.prisma.workbookProblem.findMany({
      cursor: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId: workbookId,
          problemId: cursor
        }
      },
      skip: skip,
      take: take,
      where: { workbookId: workbookId },
      select: this.relatedProblemsSelectOption
    })
  }

  async getWorkbookProblem(workbookId: number, problemId: number) {
    return await this.prisma.workbookProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          workbookId: workbookId,
          problemId: problemId
        }
      },
      select: this.relatedProblemSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }
}
