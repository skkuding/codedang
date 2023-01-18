import { Injectable } from '@nestjs/common'
import { ContestProblem, Problem, WorkbookProblem } from '@prisma/client'
import { PUBLIC_GROUP_ID } from 'src/common/contstants'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'

/**
 * repository에서는 partial entity를 반환합니다.
 * 반환된 data를 service에서 class-transformer를 사용하여 ResponseDto로 변환합니다
 *
 * repository는 ORM 쿼리를 위한 layer입니다. unit test에서는 제외하고, 통합 테스트(e2e test)에서 실제 반환값과 ResponseDto가 일치하는지 비교를 통해 검증합니다
 * https://softwareengineering.stackexchange.com/questions/185326/why-do-i-need-unit-tests-for-testing-repository-methods
 *
 *  TODO: wrapper와 제네릭을 사용해서 중복된 코드를 제거합니다
 * https://dev.to/harryhorton/how-to-wrap-a-prisma-method-and-reuse-types-271a
 */

const problemsSelectOption = {
  id: true,
  title: true
}

const problemSelectOption = {
  ...problemsSelectOption,
  difficulty: true,
  submissionNum: true,
  acceptedNum: true,
  description: true,
  inputDescription: true,
  outputDescription: true,
  hint: true,
  languages: true,
  timeLimit: true,
  memoryLimit: true,
  source: true
}

const relatedProblemSelectOption = {
  displayId: true,
  problem: {
    select: problemSelectOption
  }
}

const relatedProblemsSelectOption = {
  displayId: true,
  problem: {
    select: problemsSelectOption
  }
}

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProblems(paginationDto: PaginationDto): Promise<Partial<Problem>[]> {
    return await this.prisma.problem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: {
        isPublic: true,
        groupId: PUBLIC_GROUP_ID
      },
      select: {
        ...problemsSelectOption,
        difficulty: true,
        submissionNum: true,
        acceptedNum: true
      }
    })
  }

  async getProblem(problemId: number): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        isPublic: true,
        groupId: PUBLIC_GROUP_ID
      },
      select: problemSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getContestProblems(
    contestId: number,
    paginationDto: PaginationDto
  ): Promise<Partial<ContestProblem> & { problem: Partial<Problem> }[]> {
    return await this.prisma.contestProblem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { contestId: contestId },
      select: relatedProblemsSelectOption
    })
  }

  async getContestProblem(
    contestId: number,
    problemId: number
  ): Promise<Partial<ContestProblem> & { problem: Partial<Problem> }> {
    return await this.prisma.contestProblem.findUnique({
      where: {
        contestProblemUniqueConstraint: {
          contestId: contestId,
          problemId: problemId
        }
      },
      select: relatedProblemSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getWorkbookProblems(
    workbookId: number,
    paginationDto: PaginationDto
  ): Promise<(Partial<WorkbookProblem> & { problem: Partial<Problem> })[]> {
    return await this.prisma.workbookProblem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { workbookId: workbookId },
      select: relatedProblemsSelectOption
    })
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number
  ): Promise<Partial<WorkbookProblem> & { problem: Partial<Problem> }> {
    return await this.prisma.workbookProblem.findUnique({
      where: {
        workbookProblemUniqueConstraint: {
          workbookId: workbookId,
          problemId: problemId
        }
      },
      select: relatedProblemSelectOption,
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }
}
