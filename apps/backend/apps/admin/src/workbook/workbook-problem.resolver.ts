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

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() workbookProblem: WorkbookProblem) {
    return await this.problemService.getProblemById(workbookProblem.problemId)
  }
}
