import { UsePipes, ValidationPipe } from '@nestjs/common'
import {
  Args,
  Context,
  Query,
  Int,
  Mutation,
  Resolver,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Group, ProblemTag, ProblemTestcase, UpdateHistory } from '@generated'
import { Role } from '@prisma/client'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { ForbiddenAccessException } from '@libs/exception'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput
} from '../model/problem.input'
import { ProblemWithIsVisible } from '../model/problem.output'
import { ProblemService, TagService, TestcaseService } from '../services'

@Resolver(() => ProblemWithIsVisible)
@UseDisableAdminGuard()
export class ProblemResolver {
  constructor(
    private readonly problemService: ProblemService,
    private readonly tagService: TagService,
    private readonly testcaseService: TestcaseService
  ) {}

  @Mutation(() => ProblemWithIsVisible)
  async createProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateProblemInput
  ) {
    return await this.problemService.createProblem(
      input,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => [ProblemWithIsVisible])
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: UploadFileInput
  ) {
    return await this.problemService.uploadProblems(
      input,
      req.user.id,
      req.user.role
    )
  }

  @Query(() => [ProblemWithIsVisible])
  async getProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: FilterProblemsInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('my', { defaultValue: false, type: () => Boolean }) my: boolean,
    @Args('shared', { defaultValue: false, type: () => Boolean })
    shared: boolean
  ) {
    if (!my && !shared && req.user.role == Role.User) {
      throw new ForbiddenAccessException(
        'User does not have permission for all problems'
      )
    }
    return await this.problemService.getProblems({
      userId: req.user.id,
      input,
      cursor,
      take,
      my,
      shared
    })
  }

  @Query(() => ProblemWithIsVisible)
  async getProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.getProblem(id, req.user.role, req.user.id)
  }

  @ResolveField('updateHistory', () => [UpdateHistory])
  async getProblemUpdateHistory(@Parent() problem: ProblemWithIsVisible) {
    return await this.problemService.getProblemUpdateHistory(problem.id)
  }

  @ResolveField('sharedGroups', () => [Group])
  async getSharedGroups(@Parent() problem: ProblemWithIsVisible) {
    return await this.problemService.getSharedGroups(problem.id)
  }

  @ResolveField('tag', () => [ProblemTag])
  async getProblemTags(@Parent() problem: ProblemWithIsVisible) {
    return await this.tagService.getProblemTags(problem.id)
  }

  @ResolveField('testcase', () => [ProblemTestcase])
  async getProblemTestCases(@Parent() problem: ProblemWithIsVisible) {
    return await this.testcaseService.getProblemTestcases(problem.id)
  }

  @Mutation(() => ProblemWithIsVisible)
  async updateProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: UpdateProblemInput
  ) {
    return await this.problemService.updateProblem(
      input,
      req.user.role,
      req.user.id
    )
  }

  @Mutation(() => ProblemWithIsVisible)
  async deleteProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.deleteProblem(
      id,
      req.user.role,
      req.user.id
    )
  }
}
