import { BadRequestException } from '@nestjs/common'
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { OPEN_SPACE_ID } from '@libs/constants'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemDto } from './dto/create-problem.dto'
import {
  GetGroupProblemDto,
  GetGroupProblemsDto,
  DeleteGroupProblemDto
} from './dto/request-problem.dto'
import { GetOpenSpaceProblemsDto } from './dto/request-problem.dto'
import { UpdateProblem } from './dto/update-problem.dto'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem, { name: 'getGroupProblem' })
  async getGroupProblem(
    @Args('getGroupProblemInput') getGroupProblemInput: GetGroupProblemDto
  ) {
    return await this.problemService.findOne(getGroupProblemInput)
  }

  @Query(() => [Problem], { name: 'getGroupProblems' })
  async getGroupProblems(
    @Args('getGroupProblemsInput') getGroupProblemsInput: GetGroupProblemsDto
  ) {
    if (getGroupProblemsInput.groupId == OPEN_SPACE_ID) {
      throw new BadRequestException('unauthorized')
    } else {
      return await this.problemService.findAll(getGroupProblemsInput)
    }
  }

  @Query(() => [Problem], { name: 'getOpenSpaceProblems' })
  async getOpenSpaceProblems(
    @Args('getOpenSpaceProblemsInput')
    getOpenSpaceProblemsInput: GetOpenSpaceProblemsDto
  ) {
    return await this.problemService.findAll({
      groupId: OPEN_SPACE_ID,
      ...getOpenSpaceProblemsInput
    })
  }

  @Mutation(() => String, { name: 'createGroupProblem' })
  async createGroupProblem(
    @Args('createGroupProblemInput')
    createGroupProblemInput: CreateGroupProblemDto
  ) {
    return await this.problemService.create(createGroupProblemInput)
  }

  @Mutation(() => String, { name: 'deleteGroupProblem' })
  async deleteGroupProblem(
    @Args('deleteGroupProblemInput')
    deleteGroupProblemInput: DeleteGroupProblemDto
  ) {
    return await this.problemService.delete(deleteGroupProblemInput)
  }

  @Mutation(() => Problem, { name: 'updateGroupProblem' })
  async updateGroupProblem(
    @Args('updateGroupProblemInput') updateGroupProblemInput: UpdateProblem
  ) {
    return await this.problemService.update(updateGroupProblemInput)
  }
}
