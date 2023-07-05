import { NotFoundException, Res, UnauthorizedException } from '@nestjs/common'
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemDto } from './dto/create-problem.dto'
import {
  GetGroupProblemDto,
  GetGroupProblemsDto,
  DeleteGroupProblemDto
} from './dto/request-problem.dto'
import { UpdateProblemDto } from './dto/update-problem.dto'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem, { name: 'getGroupProblem' })
  async getGroupProblem(
    @Args('groupId') groupId: number,
    @Args('input') getGroupProblemInput: GetGroupProblemDto
  ) {
    const problem = await this.problemService.getOne(getGroupProblemInput)
    if (groupId != problem.groupId && groupId != OPEN_SPACE_ID) {
      throw new UnauthorizedException()
    }
    return problem
  }

  @Query(() => [Problem], { name: 'getGroupProblems' })
  async getGroupProblems(
    @Args('groupId') groupId: number = OPEN_SPACE_ID,
    @Args('input') getGroupProblemsInput: GetGroupProblemsDto
  ) {
    if (groupId != getGroupProblemsInput.groupId && groupId != OPEN_SPACE_ID) {
      throw new UnauthorizedException()
    }
    return await this.problemService.getAll(getGroupProblemsInput)
  }

  @Mutation(() => Problem, { name: 'createGroupProblem' })
  async createGroupProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId') groupId: number,
    @Args('input')
    createGroupProblemInput: CreateGroupProblemDto
  ) {
    if (
      groupId != createGroupProblemInput.groupId &&
      groupId != OPEN_SPACE_ID
    ) {
      throw new UnauthorizedException()
    }
    return await this.problemService.create(
      req.user.id,
      createGroupProblemInput
    )
  }

  @Mutation(() => Problem, { name: 'deleteGroupProblem' })
  async deleteGroupProblem(
    @Args('groupId') groupId: number,
    @Args('input')
    deleteGroupProblemInput: DeleteGroupProblemDto
  ) {
    try {
      const problem = await this.problemService.getOne({
        problemId: deleteGroupProblemInput.problemId
      })
      if (problem.groupId != groupId && groupId != OPEN_SPACE_ID) {
        throw new UnauthorizedException()
      }
    } catch {
      throw new NotFoundException()
    }

    return await this.problemService.delete(deleteGroupProblemInput)
  }

  @Mutation(() => Problem, { name: 'updateGroupProblem' })
  async updateGroupProblem(
    @Args('groupId') groupId: number,
    @Args('input') updateGroupProblemInput: UpdateProblemDto
  ) {
    try {
      const problem = await this.problemService.getOne({
        problemId: updateGroupProblemInput.problemId
      })
      if (problem.groupId != groupId && groupId != OPEN_SPACE_ID) {
        throw new UnauthorizedException()
      }
    } catch {
      throw new NotFoundException()
    }
    return await this.problemService.update(updateGroupProblemInput)
  }
}
