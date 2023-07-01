import { BadRequestException } from '@nestjs/common'
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { isDefined } from 'class-validator'
import { OPEN_SPACE_ID } from '@libs/constants'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemDto } from './dto/create-problem.dto'
import {
  GetGroupProblemDto,
  GetGroupProblemsDto,
  DeleteGroupProblemDto
} from './dto/request-problem.dto'
import { GetOpenSpaceProblemDto } from './dto/request-problem.dto'
import { UpdateProblem } from './dto/update-problem.dto'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem, { name: 'getGroupProblem' })
  async getById(
    @Args('getGroupProblemInput') getGroupProblemInput: GetGroupProblemDto
  ) {
    return await this.problemService.findOne(getGroupProblemInput)
  }

  @Query(() => [Problem], { name: 'getGroupProblems' })
  async getAllByGroup(
    @Args('getGroupProblemsInput') getGroupProblemsInput: GetGroupProblemsDto
  ) {
    if (!isDefined(getGroupProblemsInput.groupId)) {
      throw new BadRequestException()
    } else if (getGroupProblemsInput.groupId == OPEN_SPACE_ID) {
      throw new BadRequestException('unauthorized')
    }
    return await this.problemService.findAll(getGroupProblemsInput)
  }

  @Query(() => [Problem], { name: 'getOpenSpaceProblems' })
  async getAllOpenSpace(
    @Args('getOpenSpaceProblemsInput')
    getOpenSpaceProblemsInput: GetOpenSpaceProblemDto
  ) {
    if (
      isDefined(getOpenSpaceProblemsInput.groupId) &&
      getOpenSpaceProblemsInput.groupId != OPEN_SPACE_ID
    ) {
      throw new BadRequestException()
    }
    getOpenSpaceProblemsInput.groupId = OPEN_SPACE_ID
    return await this.problemService.findAll({ ...getOpenSpaceProblemsInput })
  }

  @Mutation(() => String, { name: 'createGroupProblem' })
  async createProblem(
    @Args('createGroupProblemInput')
    createGroupProblemInput: CreateGroupProblemDto
  ) {
    return await this.problemService.create(createGroupProblemInput)
  }

  @Mutation(() => String, { name: 'deleteGroupProblem' })
  async removeProblem(
    @Args('deleteGroupProblemInput')
    deleteGroupProblemInput: DeleteGroupProblemDto
  ) {
    return await this.problemService.remove(deleteGroupProblemInput)
  }

  @Mutation(() => Problem, { name: 'updateGroupProblem' })
  async updateProblem(
    @Args('updateGroupProblemInput') updateGroupProblemInput: UpdateProblem
  ) {
    return await this.problemService.update(updateGroupProblemInput)
  }
}
