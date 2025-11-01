import { ParseArrayPipe } from '@nestjs/common'
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import {
  Contest,
  ContestQnA,
  ContestQnAComment,
  User,
  UserContest
} from '@generated'
import { ContestRole } from '@prisma/client'
import {
  AuthenticatedRequest,
  UseContestRolesGuard,
  UseDisableContestRolesGuard
} from '@libs/auth'
import {
  CursorValidationPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { ContestProblem } from '@admin/@generated'
import { ProblemWithIsVisible } from '@admin/problem/model/problem.output'
import { ProblemService } from '@admin/problem/services'
import { UserService } from '@admin/user/user.service'
import { ContestProblemService } from './contest-problem.service'
import { ContestQnAService } from './contest-qna.service'
import { ContestService } from './contest.service'
import { ContestLeaderboard } from './model/contest-leaderboard.model'
import { GetContestQnAsFilterInput } from './model/contest-qna.input'
import { ContestQnAWithIsRead } from './model/contest-qna.model'
import { ContestSubmissionSummaryForUser } from './model/contest-submission-summary-for-user.model'
import { ContestUpdateHistories } from './model/contest-update-histories.model'
import { ContestWithParticipants } from './model/contest-with-participants.model'
import { CreateContestInput, UpdateContestInput } from './model/contest.input'
import { ContestsGroupedByStatus } from './model/contests-grouped-by-status.output'
import { ProblemScoreInput } from './model/problem-score.input'
import { UserContestScoreSummaryWithUserInfo } from './model/score-summary'

@Resolver(() => ContestWithParticipants)
@UseContestRolesGuard(ContestRole.Manager)
export class ContestResolver {
  constructor(
    private readonly contestService: ContestService,
    private readonly userService: UserService
  ) {}

  @Query(() => [ContestWithParticipants])
  @UseDisableContestRolesGuard()
  async getContests(
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.getContests(req.user.id, take, cursor)
  }

  @Query(() => ContestWithParticipants)
  async getContest(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.contestService.getContest(contestId)
  }

  @Mutation(() => Contest)
  @UseDisableContestRolesGuard()
  async createContest(
    @Args('input') input: CreateContestInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.createContest(req.user.id, input)
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('input') input: UpdateContestInput
  ) {
    return await this.contestService.updateContest(contestId, input)
  }

  @Mutation(() => Contest)
  async deleteContest(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.deleteContest(contestId)
  }

  @Mutation(() => UserContest)
  @UseDisableContestRolesGuard()
  async removeUserFromContest(
    @Args('contestId', { type: () => Int }, IDValidationPipe)
    contestId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe)
    userId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.removeUserFromContest(
      contestId,
      userId,
      req.user.id
    )
  }

  @Query(() => ContestSubmissionSummaryForUser)
  async getContestSubmissionSummaryByUserId(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number,
    @Args('problemId', { nullable: true, type: () => Int }, IDValidationPipe)
    problemId: number,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.contestService.getContestSubmissionSummaryByUserId({
      take,
      contestId,
      userId,
      problemId,
      cursor
    })
  }

  @Query(() => [UserContestScoreSummaryWithUserInfo])
  async getContestScoreSummaries(
    @Args('contestId', { type: () => Int, nullable: false }, IDValidationPipe)
    contestId: number,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('searchingName', { type: () => String, nullable: true })
    searchingName?: string
  ) {
    return await this.contestService.getContestScoreSummaries({
      contestId,
      take,
      cursor,
      searchingName
    })
  }

  @Query(() => ContestsGroupedByStatus)
  @UseDisableContestRolesGuard()
  async getContestsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.contestService.getContestsByProblemId(problemId)
  }

  @Query(() => ContestLeaderboard)
  async getContestLeaderboard(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return this.contestService.getContestLeaderboard(contestId)
  }

  @Query(() => ContestUpdateHistories)
  async getContestUpdateHistories(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.getContestUpdateHistories(contestId)
  }

  @Query(() => [UserContest])
  @UseDisableContestRolesGuard()
  async getContestRoles(@Context('req') req: AuthenticatedRequest) {
    return await this.contestService.getContestRoles(req.user.id)
  }

  @ResolveField('createdBy', () => User, { nullable: true })
  async getUser(@Parent() contest: Contest) {
    const { createdById } = contest
    if (createdById == null) {
      return null
    }
    return await this.userService.getUser(createdById)
  }
}

@Resolver(() => ContestProblem)
@UseContestRolesGuard(ContestRole.Reviewer)
export class ContestProblemResolver {
  constructor(
    private readonly contestProblemService: ContestProblemService,
    private readonly problemService: ProblemService
  ) {}

  @Query(() => [ContestProblem], { name: 'getContestProblems' })
  async getContestProblems(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.contestProblemService.getContestProblems(contestId)
  }

  @Mutation(() => [ContestProblem])
  async importProblemsToContest(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.contestProblemService.importProblemsToContest(
      contestId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [ContestProblem])
  async removeProblemsFromContest(
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Args('problemIds', { type: () => [Int] }) problemIds: number[]
  ) {
    return await this.contestProblemService.removeProblemsFromContest(
      contestId,
      problemIds
    )
  }

  @Mutation(() => [ContestProblem])
  @UseContestRolesGuard(ContestRole.Manager)
  async updateContestProblemsScore(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.contestProblemService.updateContestProblemsScore(
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
    return await this.contestProblemService.updateContestProblemsOrder(
      contestId,
      orders
    )
  }

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() contestProblem: ContestProblem) {
    return await this.problemService.getProblemById(contestProblem.problemId)
  }
}

@Resolver(() => ContestQnA)
@UseContestRolesGuard(ContestRole.Manager)
export class ContestQnAResolver {
  constructor(private readonly contestQnAService: ContestQnAService) {}

  @Query(() => [ContestQnAWithIsRead])
  async getContestQnAs(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('filter', { type: () => GetContestQnAsFilterInput, nullable: true })
    filter?: GetContestQnAsFilterInput
  ) {
    return await this.contestQnAService.getContestQnAs(
      contestId,
      req.user.id,
      take,
      cursor,
      filter
    )
  }

  @Query(() => ContestQnA)
  async getContestQnA(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Context('req') req: AuthenticatedRequest,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number
  ) {
    return await this.contestQnAService.getContestQnA(
      contestId,
      req.user.id,
      order
    )
  }

  @Mutation(() => ContestQnA)
  async deleteContestQnA(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number
  ) {
    return await this.contestQnAService.deleteContestQnA(contestId, order)
  }

  @Mutation(() => ContestQnAComment)
  async createContestQnAComment(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Context('req') req: AuthenticatedRequest,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number,
    @Args('content', { type: () => String }) content: string
  ) {
    return await this.contestQnAService.createContestQnAComment(
      contestId,
      req.user.id,
      order,
      content
    )
  }

  @Mutation(() => ContestQnAComment)
  async deleteContestQnAComment(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Args('qnAOrder', { type: () => Int }, IDValidationPipe) qnAOrder: number,
    @Args('commentOrder', { type: () => Int }, IDValidationPipe)
    commentOrder: number
  ) {
    return await this.contestQnAService.deleteContestQnAComment(
      contestId,
      qnAOrder,
      commentOrder
    )
  }

  @Mutation(() => ContestQnA)
  @UseDisableContestRolesGuard()
  async toggleContestQnAResolved(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Args('qnAOrder', { type: () => Int }, IDValidationPipe) qnAOrder: number
  ) {
    return await this.contestQnAService.toggleContestQnAResolved(
      contestId,
      qnAOrder
    )
  }
}
