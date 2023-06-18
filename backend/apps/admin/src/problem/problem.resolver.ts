import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { ProblemService } from './problem.service'
import { Problem } from '@admin/@generated/problem/problem.model'
import { UpdateProblem } from './dto/update-problem.dto'
import { CreateProblem } from './dto/create-problem.dto'
import {
  GetGroupProblem,
  GetGroupProblems,
  RemoveGroupProblem
} from './dto/request-problem.dto'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem, { name: 'getGroupProblemByProblemId' })
  async getById(
    @Args('getGroupProblemInput') getGroupProblemInput: GetGroupProblem
  ) {
    return await this.problemService.findOne(getGroupProblemInput.problemId)
  }

  @Query(() => [Problem], { name: 'getGroupProblemByGroupId' })
  async geAllByGroup(
    @Args('getGroupProbelmsInput') getGroupProblemsInput: GetGroupProblems
  ) {
    return await this.problemService.findAll(
      getGroupProblemsInput.groupId,
      getGroupProblemsInput.cursor,
      getGroupProblemsInput.take
    )
  }

  @Mutation(() => Problem, { name: 'createGroupProblem' })
  async createProblem(
    @Args('problemCreateInput') problemCreateInput: CreateProblem
  ) {
    return await this.problemService.create(problemCreateInput)
  }

  @Mutation(() => Problem, { name: 'removeGroupProblemByProblemId' })
  async removeProblem(
    @Args('removeGroupProblemInput') removeGroupProblemInput: RemoveGroupProblem
  ) {
    return await this.problemService.remove(removeGroupProblemInput.problemId)
  }

  @Mutation(() => Problem, { name: 'updateGroupProblem' })
  async updateProblem(
    @Args('updateGroupProblemInput') updateGroupProblemInput: UpdateProblem
  ) {
    return await this.problemService.update(updateGroupProblemInput)
  }
}
