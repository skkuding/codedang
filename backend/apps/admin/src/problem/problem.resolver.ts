import { ParseIntPipe } from '@nestjs/common'
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemInput } from './dto/create-problem.dto'
import {
  GetGroupProblemInput,
  GetGroupProblemsInput,
  DeleteGroupProblemInput
} from './dto/request-problem.dto'
import { UpdateProblemInput } from './dto/update-problem.dto'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem)
  async getGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: GetGroupProblemInput
  ) {
    return await this.problemService.getGroupProblem(groupId, input)
  }

  @Query(() => [Problem])
  async getGroupProblems(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: GetGroupProblemsInput
  ) {
    return await this.problemService.getGroupProblems(groupId, input)
  }

  @Mutation(() => Problem)
  async createGroupProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: CreateGroupProblemInput
  ) {
    return await this.problemService.createGroupProblem(
      req.user.id,
      groupId,
      input
    )
  }

  @Mutation(() => Problem)
  async deleteGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: DeleteGroupProblemInput
  ) {
    return await this.problemService.deleteGroupProblem(groupId, input)
  }

  @Mutation(() => Problem)
  async updateGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    return await this.problemService.updateGroupProblem(groupId, input)
  }
}
