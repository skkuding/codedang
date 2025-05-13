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
  AssignmentProblem,
  ContestProblem,
  Group,
  ProblemTag,
  ProblemTestcase,
  UpdateHistory,
  WorkbookProblem
} from '@generated'
import { ContestRole, Role } from '@prisma/client'
import {
  AuthenticatedRequest,
  UseContestRolesGuard,
  UseDisableAdminGuard,
  UseGroupLeaderGuard
} from '@libs/auth'
import { ForbiddenAccessException } from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ProblemScoreInput } from '@admin/contest/model/problem-score.input'
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

@Resolver(() => ContestProblem)
@UseContestRolesGuard(ContestRole.Reviewer)
export class ContestProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [ContestProblem], { name: 'getContestProblems' })
  async getContestProblems(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.problemService.getContestProblems(contestId)
  }

  @Mutation(() => [ContestProblem])
  @UseContestRolesGuard(ContestRole.Manager)
  async updateContestProblemsScore(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.problemService.updateContestProblemsScore(
      contestId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [ContestProblem])
  @UseContestRolesGuard(ContestRole.Manager)
  async updateContestProblemsOrder(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.problemService.updateContestProblemsOrder(
      contestId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() contestProblem: ContestProblem) {
    return await this.problemService.getProblemById(contestProblem.problemId)
  }
}

@Resolver(() => AssignmentProblem)
@UseGroupLeaderGuard()
export class AssignmentProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [AssignmentProblem], { name: 'getAssignmentProblems' })
  async getAssignmentProblems(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmenttId')
    )
    assignmentId: number
  ) {
    return await this.problemService.getAssignmentProblems(
      groupId,
      assignmentId
    )
  }

  @Mutation(() => [AssignmentProblem])
  async updateAssignmentProblemsScore(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.problemService.updateAssignmentProblemsScore(
      groupId,
      assignmentId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [AssignmentProblem])
  async updateAssignmentProblemsOrder(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args(
      'assignmentId',
      { type: () => Int },
      new RequiredIntPipe('assignmentId')
    )
    assignmentId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    return await this.problemService.updateAssignmentProblemsOrder(
      groupId,
      assignmentId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() assignmentProblem: AssignmentProblem) {
    return await this.problemService.getProblemById(assignmentProblem.problemId)
  }
}

@Resolver(() => WorkbookProblem)
@UseGroupLeaderGuard()
export class WorkbookProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [WorkbookProblem], { name: 'getWorkbookProblems' })
  async getWorkbookProblems(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number
  ) {
    return await this.problemService.getWorkbookProblems(groupId, workbookId)
  }

  @Mutation(() => [WorkbookProblem])
  async updateWorkbookProblemsOrder(
    @Args('groupId', { type: () => Int }, GroupIDPipe)
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
