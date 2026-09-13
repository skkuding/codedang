import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { ProblemStatus } from '@admin/@generated'
import { CreateMandeuldangProblemInput } from '../model/problem.input'
import { MandeuldangProblemOutput } from '../model/problem.output'
import { MandeuldangProblemService } from '../services/problem.service'

@Resolver(() => MandeuldangProblemOutput)
@UseDisableAdminGuard()
export class MandeuldangProblemResolver {
  constructor(private readonly problemService: MandeuldangProblemService) {}

  @Mutation(() => MandeuldangProblemOutput)
  async createMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateMandeuldangProblemInput
  ) {
    return await this.problemService.createProblem(input, req.user.id)
  }

  @Mutation(() => MandeuldangProblemOutput)
  async deleteMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.deleteProblem(id, req.user.id)
  }

  @Query(() => [MandeuldangProblemOutput])
  async getMyMandeuldangProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('status', { nullable: true, type: () => ProblemStatus })
    status?: ProblemStatus
  ) {
    return await this.problemService.getMyProblems(
      req.user.id,
      cursor,
      take,
      status
    )
  }

  @Query(() => [MandeuldangProblemOutput])
  async getInProgressMandeuldangProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('status', { nullable: true, type: () => ProblemStatus })
    status?: ProblemStatus
  ) {
    return await this.problemService.getInProgressProblems(
      req.user.id,
      cursor,
      take,
      status
    )
  }

  @Query(() => MandeuldangProblemOutput)
  async getMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.getProblem(id, req.user.id, req.user.role)
  }
}
