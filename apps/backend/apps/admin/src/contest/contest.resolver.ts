import { ParseBoolPipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Contest, ContestProblem } from '@generated'
import { ContestRole } from '@prisma/client'
import {
  AuthenticatedRequest,
  UseContestRolesGuard,
  UseDisableAdminGuard
} from '@libs/auth'
import {
  CursorValidationPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { ContestService } from './contest.service'
import { ContestSubmissionSummaryForUser } from './model/contest-submission-summary-for-user.model'
import { ContestWithParticipants } from './model/contest-with-participants.model'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
import { ContestsGroupedByStatus } from './model/contests-grouped-by-status.output'
import { DuplicatedContestResponse } from './model/duplicated-contest-response.output'
import { ProblemScoreInput } from './model/problem-score.input'
import { PublicizingRequest } from './model/publicizing-request.model'
import { PublicizingResponse } from './model/publicizing-response.output'
import { UserContestScoreSummaryWithUserInfo } from './model/score-summary'

@Resolver(() => Contest)
@UseContestRolesGuard(ContestRole.Manager)
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [ContestWithParticipants])
  @UseDisableAdminGuard()
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
  @UseDisableAdminGuard()
  async createContest(
    @Args('input') input: CreateContestInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.createContest(req.user.id, input)
  }

  @Mutation(() => Contest)
  async updateContest(@Args('input') input: UpdateContestInput) {
    return await this.contestService.updateContest(input)
  }

  @Mutation(() => Contest)
  async deleteContest(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.deleteContest(contestId)
  }

  /**
   * Contest를 공개(Open Space)로 이동시키기 위한 요청(Publicizing Requests)들을 불러옵니다.
   * @returns Publicizing Request 배열
   */
  @Query(() => [PublicizingRequest])
  async getPublicizingRequests() {
    return await this.contestService.getPublicizingRequests()
  }

  /**
   * Contest를 공개(Open Space)로 이동시키기 위한 요청(Publicizing Request)을 생성합니다.
   * @param contestId Contest의 ID
   * @returns 생성된 Publicizing Request
   */
  @Mutation(() => PublicizingRequest)
  async createPublicizingRequest(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.createPublicizingRequest(contestId)
  }

  /**
   * Contest를 공개(Open Space)로 이동시키기 위한 요청(Publicizing Request)을 처리합니다.
   * @param contestId Publicizing Request를 생성한 contest의 Id
   * @param isAccepted 요청 수락 여부
   * @returns
   */
  @Mutation(() => PublicizingResponse)
  async handlePublicizingRequest(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('isAccepted', ParseBoolPipe) isAccepted: boolean
  ) {
    return await this.contestService.handlePublicizingRequest(
      contestId,
      isAccepted
    )
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

  @Mutation(() => DuplicatedContestResponse)
  async duplicateContest(
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.duplicateContest(contestId, req.user.id)
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
  async getContestsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.contestService.getContestsByProblemId(problemId)
  }
}
