import { Injectable } from '@nestjs/common'
import { Prisma, Problem } from '@prisma/client'
import { PUBLIC_GROUP_ID } from 'src/common/contstants'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'

/**
 * repository에서는 partial entity를 반환합니다.
 * 반환된 entity를 service에서 class-transformer를 사용하여 ResponseDto로 변환합니다
 *
 * repository는 ORM 쿼리를 위한 layer입니다. unit test에서는 제외하고, 통합 테스트(e2e test)에서 실제 반환값과 ResponseDto가 일치하는지 비교를 통해 검증합니다
 * https://softwareengineering.stackexchange.com/questions/185326/why-do-i-need-unit-tests-for-testing-repository-methods
 *
 *  TODO: wrapper와 제네릭을 사용해서 중복된 코드를 제거합니다
 * https://dev.to/harryhorton/how-to-wrap-a-prisma-method-and-reuse-types-271a
 */

const query = (
  query: Prisma.ProblemFindManyArgs | Prisma.ProblemFindFirstArgs, // 깔끔하게..
  select: Prisma.ProblemSelect
) => {
  if (!isEmpty(select)) query['select'] = select
  return query
}
const isEmpty = (obj: object) => Object.keys(obj).length === 0

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProblem(
    problemId: number,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst(
      query(
        {
          where: {
            id: problemId,
            is_public: true,
            GroupProblem: { every: { group_id: PUBLIC_GROUP_ID } }
          },
          include: {
            GroupProblem: {
              select: {
                id: true // displayid? // 그리고 DTO에서 이걸 바꿔주는거지! @Type()을 써서... 그니까 쿼리로 select할수있게하는접근방식은 너무 복잡하다는게 결론!
              }
            }
          },
          rejectOnNotFound: () => new EntityNotExistException('Problem')
        },
        select // 그럼 얘를 안쪽에다 못걸텐데? 아무래도 이건 좋은 선택은 아닌듯!
      )
    )
  }

  async getProblemOfContest(
    contestId: number,
    problemId: number,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst(
      query(
        {
          where: {
            id: problemId,
            ContestProblem: { every: { contest_id: contestId } }
          },
          rejectOnNotFound: () => new EntityNotExistException('Problem')
        },
        select
      )
    )
  }

  async getProblemOfWorkbook(
    workbookId: number,
    problemId: number,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>> {
    return await this.prisma.problem.findFirst(
      query(
        {
          where: {
            id: problemId,
            WorkbookProblem: { every: { workbook_id: workbookId } }
          },
          rejectOnNotFound: () => new EntityNotExistException('Problem')
        },
        select
      )
    )
  }

  async getPublicProblems(
    paginationDto: PaginationDto,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>[]> {
    return await this.prisma.problem.findMany(
      query(
        {
          skip: paginationDto.offset,
          take: paginationDto.limit,
          where: {
            is_public: true,
            GroupProblem: { every: { group_id: PUBLIC_GROUP_ID } }
          }
        },
        select
      )
    )
  }

  async getProblemsOfContest(
    contestId: number,
    paginationDto: PaginationDto,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>[]> {
    return await this.prisma.problem.findMany(
      query(
        {
          skip: paginationDto.offset,
          take: paginationDto.limit,
          where: { ContestProblem: { every: { contest_id: contestId } } }
        },
        select
      )
    )
  }

  async getProblemsOfWorkbook(
    workbookId: number,
    paginationDto: PaginationDto,
    select: Prisma.ProblemSelect = {}
  ): Promise<Partial<Problem>[]> {
    return await this.prisma.problem.findMany(
      query(
        {
          skip: paginationDto.offset,
          take: paginationDto.limit,
          where: { WorkbookProblem: { every: { workbook_id: workbookId } } }
        },
        select
      )
    )
  }
}
