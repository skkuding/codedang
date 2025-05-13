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
import { UseGroupLeaderGuard } from '@libs/auth'
import { GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { AssignmentProblem } from '@admin/@generated'
import { ProblemScoreInput } from '@admin/contest/model/problem-score.input'
import { ProblemWithIsVisible } from '@admin/problem/model/problem.output'
import { ProblemService } from '@admin/problem/services'
import { AssignmentProblemService } from './assignment-problem.service'

@Resolver(() => AssignmentProblem)
@UseGroupLeaderGuard()
export class AssignmentProblemResolver {
  constructor(
    private readonly assignmentProblemService: AssignmentProblemService,
    private readonly problemService: ProblemService
  ) {}

  @Query(() => [AssignmentProblem], { name: 'getAssignmentProblems' })
  async getAssignmentProblems(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmenttId')
    )
    assignmentId: number
  ) {
    return await this.assignmentProblemService.getAssignmentProblems(
      groupId,
      assignmentId
    )
  }

  @Mutation(() => [AssignmentProblem])
  async updateAssignmentProblemsScore(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.assignmentProblemService.updateAssignmentProblemsScore(
      groupId,
      assignmentId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [AssignmentProblem])
  async updateAssignmentProblemsOrder(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmentId')
    )
    assignmentId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.assignmentProblemService.updateAssignmentProblemsOrder(
      groupId,
      assignmentId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() assignmentProblem: AssignmentProblem) {
    return await this.problemService.getProblemById(assignmentProblem.problemId)
  }
}
