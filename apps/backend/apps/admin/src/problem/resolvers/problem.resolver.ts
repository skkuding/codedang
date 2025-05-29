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
import { Group, ProblemTag, UpdateHistory } from '@generated'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import {
  CursorValidationPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { TestcaseModel } from '@admin/testcase/model/testcase.model'
import { TestcaseService } from '@admin/testcase/testcase.service'
import {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput
} from '../model/problem.input'
import { ProblemModel } from '../model/problem.output'
import { ProblemService, TagService } from '../services'

@Resolver(() => ProblemModel)
@UseDisableAdminGuard()
export class ProblemResolver {
  constructor(
    private readonly problemService: ProblemService,
    private readonly tagService: TagService,
    private readonly testcaseService: TestcaseService
  ) {}

  @Mutation(() => ProblemModel)
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

  @Mutation(() => [ProblemModel])
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

  @Query(() => [ProblemModel])
  async getProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: FilterProblemsInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('mode', { type: () => String }) mode: 'my' | 'shared' | 'contest',
    @Args('contestId', { nullable: true, type: () => Int }, IDValidationPipe)
    contestId: number | null
  ) {
    return await this.problemService.getProblems({
      userId: req.user.id,
      input,
      cursor,
      take,
      mode,
      contestId
    })
  }

  @Query(() => ProblemModel)
  async getProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.getProblem(id, req.user.role, req.user.id)
  }

  @ResolveField('updateHistory', () => [UpdateHistory])
  async getProblemUpdateHistory(@Parent() problem: ProblemModel) {
    return await this.problemService.getProblemUpdateHistory(problem.id)
  }

  @ResolveField('sharedGroups', () => [Group])
  async getSharedGroups(@Parent() problem: ProblemModel) {
    return await this.problemService.getSharedGroups(problem.id)
  }

  @ResolveField('tag', () => [ProblemTag])
  async getProblemTags(@Parent() problem: ProblemModel) {
    return await this.tagService.getProblemTags(problem.id)
  }

  @ResolveField('testcase', () => [TestcaseModel])
  async getProblemTestCases(@Parent() problem: ProblemModel) {
    return await this.testcaseService.getTestcases(problem.id)
  }

  @Mutation(() => ProblemModel)
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

  @Mutation(() => ProblemModel)
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
