import { ParseArrayPipe } from '@nestjs/common'
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { WorkbookProblem } from '@generated'
import { UseGroupLeaderGuard } from '@libs/auth'
import { GroupIDPipe } from '@libs/pipe'
import { ProblemWithIsVisible } from '@admin/problem/model/problem.output'
import { ProblemService } from '@admin/problem/services'
import { WorkbookProblemService } from './workbook-problem.service'

@Resolver(() => WorkbookProblem)
@UseGroupLeaderGuard()
export class WorkbookProblemResolver {
  constructor(
    private readonly workbookProblemService: WorkbookProblemService,
    private readonly problemService: ProblemService
  ) {}

  /**
   * 그룹에 속한 문제집의 문제 목록을 조회합니다.
   */
  @Query(() => [WorkbookProblem], { name: 'getWorkbookProblems' })
  async getWorkbookProblems(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number
  ) {
    return await this.workbookProblemService.getWorkbookProblems(
      groupId,
      workbookId
    )
  }

  /**
   * 문제집에 포함된 문제들의 순서를 변경합니다.
   */
  @Mutation(() => [WorkbookProblem])
  async updateWorkbookProblemsOrder(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.workbookProblemService.updateWorkbookProblemsOrder(
      groupId,
      workbookId,
      orders
    )
  }

  /**
   * workbookProblem에 연결된 문제의 상세 정보를 조회합니다.
   */
  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() workbookProblem: WorkbookProblem) {
    return await this.problemService.getProblemById(workbookProblem.problemId)
  }
}
