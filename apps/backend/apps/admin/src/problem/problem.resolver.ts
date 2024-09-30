import { ParseArrayPipe, UsePipes, ValidationPipe } from '@nestjs/common'
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
import {
  ContestProblem,
  Image,
  ProblemTag,
  ProblemTestcase,
  WorkbookProblem
} from '@generated'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ImageSource } from './model/image.output'
import {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput
} from './model/problem.input'
import { ProblemWithIsVisible } from './model/problem.output'
import { ProblemService } from './problem.service'

@Resolver(() => ProblemWithIsVisible)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => ProblemWithIsVisible)
  async createProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: CreateProblemInput
  ) {
    return await this.problemService.createProblem(input, req.user.id, groupId)
  }

  @Mutation(() => [ProblemWithIsVisible])
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: UploadFileInput
  ) {
    return await this.problemService.uploadProblems(input, req.user.id, groupId)
  }

  @Mutation(() => ImageSource)
  async uploadImage(
    @Args('input') input: UploadFileInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.problemService.uploadImage(input, req.user.id)
  }

  @Mutation(() => Image)
  async deleteImage(
    @Args('filename') filename: string,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.problemService.deleteImage(filename, req.user.id)
  }

  @Query(() => [ProblemWithIsVisible])
  async getProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('input') input: FilterProblemsInput
  ) {
    return await this.problemService.getProblems(input, groupId, cursor, take)
  }

  @Query(() => ProblemWithIsVisible)
  async getProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.getProblem(id, groupId)
  }

  @ResolveField('tag', () => [ProblemTag])
  async getProblemTags(@Parent() problem: ProblemWithIsVisible) {
    return await this.problemService.getProblemTags(problem.id)
  }

  @ResolveField('testcase', () => [ProblemTestcase])
  async getProblemTestCases(@Parent() problem: ProblemWithIsVisible) {
    return await this.problemService.getProblemTestcases(problem.id)
  }

  @Mutation(() => ProblemWithIsVisible)
  async updateProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    return await this.problemService.updateProblem(input, groupId)
  }

  @Mutation(() => ProblemWithIsVisible)
  async deleteProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    return await this.problemService.deleteProblem(id, groupId)
  }
}

@Resolver(() => ContestProblem)
export class ContestProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [ContestProblem], { name: 'getContestProblems' })
  async getContestProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.problemService.getContestProblems(groupId, contestId)
  }

  @Mutation(() => [ContestProblem])
  async updateContestProblemsOrder(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.problemService.updateContestProblemsOrder(
      groupId,
      contestId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() contestProblem: ContestProblem) {
    return await this.problemService.getProblemById(contestProblem.problemId)
  }
}

@Resolver(() => WorkbookProblem)
export class WorkbookProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [WorkbookProblem], { name: 'getWorkbookProblems' })
  async getWorkbookProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number
  ) {
    return await this.problemService.getWorkbookProblems(groupId, workbookId)
  }

  @Mutation(() => [WorkbookProblem])
  async updateWorkbookProblemsOrder(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.problemService.updateWorkbookProblemsOrder(
      groupId,
      workbookId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() workbookProblem: WorkbookProblem) {
    return await this.problemService.getProblemById(workbookProblem.problemId)
  }
}
