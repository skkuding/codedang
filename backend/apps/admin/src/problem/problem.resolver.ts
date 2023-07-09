import { NotFoundException, UnauthorizedException } from '@nestjs/common'
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
    try {
      const problem = await this.problemService.getGroupProblem(input)
      if (groupId != problem.groupId && groupId != OPEN_SPACE_ID) {
        throw new UnauthorizedException()
      }
      return problem
    } catch {
      throw new NotFoundException()
    }
  }

  @Query(() => [Problem])
  async getGroupProblems(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: GetGroupProblemsInput
  ) {
    if (groupId != input.groupId && groupId != OPEN_SPACE_ID) {
      throw new UnauthorizedException()
    }
    return await this.problemService.getGroupProblems(input)
  }

  @Mutation(() => Problem)
  async createGroupProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: CreateGroupProblemInput
  ) {
    if (groupId != input.groupId && groupId != OPEN_SPACE_ID) {
      throw new UnauthorizedException()
    }
    return await this.problemService.createGroupProblem(req.user.id, input)
  }

  @Mutation(() => Problem)
  async deleteGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: DeleteGroupProblemInput
  ) {
    try {
      const problem = await this.problemService.getGroupProblem({
        problemId: input.problemId
      })
      if (problem.groupId != groupId && groupId != OPEN_SPACE_ID) {
        throw new UnauthorizedException()
      }
    } catch {
      throw new NotFoundException()
    }

    return await this.problemService.deleteGroupProblem(input)
  }

  @Mutation(() => Problem)
  async updateGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    try {
      const problem = await this.problemService.getGroupProblem({
        problemId: input.problemId
      })
      if (problem.groupId != groupId && groupId != OPEN_SPACE_ID) {
        throw new UnauthorizedException()
      }
    } catch {
      throw new NotFoundException()
    }
    return await this.problemService.updateGroupProblem(input)
  }
}
