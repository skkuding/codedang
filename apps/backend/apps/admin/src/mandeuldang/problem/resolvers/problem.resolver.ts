import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ProblemStatus as PrismaProblemStatus } from '@prisma/client'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { ProblemStatus as GraphQLProblemStatus } from '@admin/@generated'
import { CreateMandeuldangProblemInput } from '../model/problem.input'
import { MandeuldangProblemOutput } from '../model/problem.output'
import { MandeuldangProblemService } from '../services/problem.service'

@Resolver(() => MandeuldangProblemOutput)
@UseDisableAdminGuard()
export class MandeuldangProblemResolver {
  constructor(
    private readonly mandeuldangProblemService: MandeuldangProblemService
  ) {}

  @Query(() => [MandeuldangProblemOutput])
  async getMyMandeuldangProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('status', { nullable: true, type: () => GraphQLProblemStatus })
    status?: PrismaProblemStatus
  ) {
    return await this.mandeuldangProblemService.getMyProblems(
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
    @Args('status', { nullable: true, type: () => GraphQLProblemStatus })
    status?: PrismaProblemStatus
  ) {
    return await this.mandeuldangProblemService.getInProgressProblems(
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
    return await this.mandeuldangProblemService.getProblem(
      id,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => MandeuldangProblemOutput)
  async createMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateMandeuldangProblemInput
  ) {
    return await this.mandeuldangProblemService.createProblem(
      input,
      req.user.id
    )
  }

  @Mutation(() => MandeuldangProblemOutput)
  async deleteMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.mandeuldangProblemService.deleteProblem(id, req.user.id)
  }
}
