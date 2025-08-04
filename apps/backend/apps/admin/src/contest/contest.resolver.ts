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
  ContestProblem,
  ContestQnA,
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
import { UserService } from '@admin/user/user.service'
import { ContestService } from './contest.service'
import { ContestLeaderboard } from './model/contest-leaderboard.model'
import { ContestSubmissionSummaryForUser } from './model/contest-submission-summary-for-user.model'
import { ContestUpdateHistories } from './model/contest-update-histories.model'
import { ContestWithParticipants } from './model/contest-with-participants.model'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
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

  @Mutation(() => [ContestProblem])
  async importProblemsToContest(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.contestService.importProblemsToContest(
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
    return await this.contestService.removeProblemsFromContest(
      contestId,
      problemIds
    )
  }

  /**
   * 특정 Contest의 Contest Admin / Manager가 참가한 User를 참가 취소합니다.
   * @param contestId 대회 Id
   * @param userId 참가 취소할 User의 Id
   * @param req AuthenticatedRequest
   */
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

  /**
   * 특정 User의 Contest 제출 내용 요약 정보를 가져옵니다.
   *
   * Contest Overall 페이지에서 특정 유저를 선택했을 때 사용
   * @see https://github.com/skkuding/codedang/pull/1894
   */
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

  /**
   * Contest에 참여한 User와, 점수 요약을 함께 불러옵니다.
   *
   * Contest Overall 페이지의 Participants 탭의 정보
   * @see https://github.com/skkuding/codedang/pull/2029
   */
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

@Resolver(() => ContestQnA)
@UseContestRolesGuard(ContestRole.Manager)
export class ContestQnAResolver {
  constructor(
    private readonly contestService: ContestService,
    private readonly userService: UserService
  ) {}

  // @Query(() => [ContestQnA])
  // async getContestQnAs(
  //   @Args('contestId', { type: () => Int }) contestId: number
  // ) {
  //   return await this.contestService.getContestQnAs(contestId)
  // }

  // @Query(() => ContestQnA)
  // async getContestQnA(
  //   @Args('contestId', { type: () => Int }) contestId: number,
  //   @Args('order', { type: () => Int }, IDValidationPipe) order: number
  // ) {
  //   return await this.contestService.getContestQnA(contestId, order)
  // }

  // @Mutation(() => ContestQnA)
  // async updateContestQnA(
  //   @Args('contestId', { type: () => Int }) contestId: number,
  //   @Args('input') input: UpdateContestQnAInput,
  //   @Context('req') req: AuthenticatedRequest
  // ) {
  //   return await this.contestService.updateContestQnA(
  //     req.user.id,
  //     contestId,
  //     input
  //   )
  // }

  // TODO: update with data loader when n+1 query issue is fixed
  // @ResolveField('createdBy', () => User, { nullable: true })
  // async getUser(@Parent() contestQnA: ContestQnA) {
  //   const { createdById } = contestQnA
  //   if (createdById == null) {
  //     return null
  //   }
  //   return await this.userService.getUser(createdById)
  // }

  // TODO: update with data loader when n+1 query issue is fixed
  // @ResolveField('answeredBy', () => User, { nullable: true })
  // async getAnsweredBy(@Parent() contestQnA: ContestQnA) {
  //   const { answeredById } = contestQnA
  //   if (answeredById == null) {
  //     return null
  //   }
  //   return await this.userService.getUser(answeredById)
  // }
}
