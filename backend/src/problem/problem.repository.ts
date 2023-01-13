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

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProblems(paginationDto: PaginationDto): Promise<Problem[]> {
    return await this.prisma.problem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: {
        isPublic: true,
        groupId: PUBLIC_GROUP_ID
      }
    })
  }

  async getProblem(problemId: number): Promise<Problem> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        isPublic: true,
        groupId: PUBLIC_GROUP_ID
      },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getContestProblems(
    contestId: number,
    paginationDto: PaginationDto
  ): Promise<(ContestProblem & { problem: Problem })[]> {
    return await this.prisma.contestProblem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { contestId: contestId },
      include: { problem: true }
    })
  }

  async getContestProblem(
    contestId: number,
    problemId: number
  ): Promise<ContestProblem & { problem: Problem }> {
    return await this.prisma.contestProblem.findUnique({
      where: {
        contestProblemUniqueConstraint: {
          contestId: contestId,
          problemId: problemId
        }
      },
      include: { problem: true },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getWorkbookProblems(
    workbookId: number,
    paginationDto: PaginationDto
  ): Promise<(WorkbookProblem & { problem: Problem })[]> {
    return await this.prisma.workbookProblem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { workbookId: workbookId },
      include: { problem: true }
    })
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number
  ): Promise<WorkbookProblem & { problem: Problem }> {
    return await this.prisma.workbookProblem.findUnique({
      where: {
        workbookProblemUniqueConstraint: {
          workbookId: workbookId,
          problemId: problemId
        }
      },
      include: { problem: true },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }
}
