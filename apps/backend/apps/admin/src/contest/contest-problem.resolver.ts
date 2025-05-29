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
import { ContestRole } from '@prisma/client'
import { UseContestRolesGuard } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import { ContestProblem } from '@admin/@generated'
import { ProblemWithIsVisible } from '@admin/problem/model/problem.output'
import { ProblemService } from '@admin/problem/services'
import { ContestProblemService } from './contest-problem.service'
import { ProblemScoreInput } from './model/problem-score.input'

@Resolver(() => ContestProblem)
@UseContestRolesGuard(ContestRole.Reviewer)
export class ContestProblemResolver {
  constructor(
    private readonly contestProblemService: ContestProblemService,
    private readonly problemService: ProblemService
  ) {}

  @Query(() => [ContestProblem], { name: 'getContestProblems' })
  async getContestProblems(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.contestProblemService.getContestProblems(contestId)
  }

  @Mutation(() => [ContestProblem])
  @UseContestRolesGuard(ContestRole.Manager)
  async updateContestProblemsScore(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.contestProblemService.updateContestProblemsScore(
      contestId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [ContestProblem])
  @UseContestRolesGuard(ContestRole.Manager)
  async updateContestProblemsOrder(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.contestProblemService.updateContestProblemsOrder(
      contestId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() contestProblem: ContestProblem) {
    return await this.problemService.getProblemById(contestProblem.problemId)
  }
}
