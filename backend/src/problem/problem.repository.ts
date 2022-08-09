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

  async getPublicProblem(problemId: number): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        is_public: true,
        GroupProblem: { some: { group_id: PUBLIC_GROUP_ID } }
      },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getProblemOfContest(
    contestId: number,
    problemId: number
  ): Promise<Partial<Problem & ContestProblem>> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        ContestProblem: { some: { contest_id: contestId } }
      },
      include: {
        ContestProblem: { select: { display_id: true } }
      },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getProblemOfWorkbook(
    workbookId: number,
    problemId: number
  ): Promise<Partial<Problem & WorkbookProblem>> {
    return await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        WorkbookProblem: { some: { workbook_id: workbookId } }
      },
      include: {
        WorkbookProblem: { select: { display_id: true } }
      },
      rejectOnNotFound: () => new EntityNotExistException('Problem')
    })
  }

  async getPublicProblems(
    paginationDto: PaginationDto
  ): Promise<Partial<Problem>[]> {
    return await this.prisma.problem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: {
        is_public: true,
        GroupProblem: { some: { group_id: PUBLIC_GROUP_ID } }
      }
    })
  }

  async getProblemsOfContest(
    contestId: number,
    paginationDto: PaginationDto
  ): Promise<Partial<Problem & ContestProblem>[]> {
    return await this.prisma.problem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { ContestProblem: { some: { contest_id: contestId } } },
      include: {
        ContestProblem: { select: { display_id: true } }
      }
    })
  }

  async getProblemsOfWorkbook(
    workbookId: number,
    paginationDto: PaginationDto
  ): Promise<Partial<Problem & WorkbookProblem>[]> {
    return await this.prisma.problem.findMany({
      skip: paginationDto.offset,
      take: paginationDto.limit,
      where: { WorkbookProblem: { some: { workbook_id: workbookId } } },
      include: {
        WorkbookProblem: { select: { display_id: true } }
      }
    })
  }
}
