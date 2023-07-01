import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemDto } from './dto/create-problem.dto'
import {
  GetGroupProblemDto,
  GetGroupProblemsDto,
  DeleteGroupProblemDto
} from './dto/request-problem.dto'
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
  async geAllByGroup(
    @Args('getGroupProblemsInput') getGroupProblemsInput: GetGroupProblemsDto
  ) {
    return await this.problemService.findAll(getGroupProblemsInput)
  }

  @Mutation(() => String, { name: 'createGroupProblem' })
  async createProblem(
    @Args('createGroupProblemInput')
    createGroupProblemInput: CreateGroupProblemDto
  ) {
    return await this.problemService.create(createGroupProblemInput)
  }

  @Mutation(() => Problem, { name: 'deleteGroupProblem' })
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
