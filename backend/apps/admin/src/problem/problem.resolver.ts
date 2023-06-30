import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { ProblemService } from './problem.service'
import { Problem } from '@admin/@generated/problem/problem.model'
import { UpdateProblem } from './dto/update-problem.dto'
import { CreateGroupProblemDto } from './dto/create-problem.dto'
import {
  GetGroupProblemDto,
  GetGroupProblemsDto,
  DeleteGroupProblemDto
} from './dto/request-problem.dto'

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

  @Mutation(() => Problem, { name: 'createGroupProblem' })
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
