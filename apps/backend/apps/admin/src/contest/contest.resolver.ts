import { ParseBoolPipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Contest, ContestProblem } from '@generated'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  CursorValidationPipe,
  GroupIDPipe,
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
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [ContestWithParticipants])
  async getContests(
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.contestService.getContests(take, groupId, cursor)
  }

  @Query(() => ContestWithParticipants)
  async getContest(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    return await this.contestService.getContest(contestId)
  }

  @Mutation(() => Contest)
  async createContest(
    @Args('input') input: CreateContestInput,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.createContest(groupId, req.user.id, input)
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('input') input: UpdateContestInput
  ) {
    return await this.contestService.updateContest(groupId, input)
  }

  @Mutation(() => Contest)
  async deleteContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.deleteContest(groupId, contestId)
  }

  @Query(() => [PublicizingRequest])
  @UseRolesGuard()
  async getPublicizingRequests() {
    return await this.contestService.getPublicizingRequests()
  }

  @Mutation(() => PublicizingRequest)
  async createPublicizingRequest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.contestService.createPublicizingRequest(
      groupId,
      contestId
    )
  }

  @Mutation(() => PublicizingResponse)
  @UseRolesGuard()
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
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.contestService.importProblemsToContest(
      groupId,
      contestId,
      problemIdsWithScore
    )
  }

  @Mutation(() => [ContestProblem])
  async removeProblemsFromContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Args('problemIds', { type: () => [Int] }) problemIds: number[]
  ) {
    return await this.contestService.removeProblemsFromContest(
      groupId,
      contestId,
      problemIds
    )
  }

  /**
   * 특정 User의 Contest 제출 내용 요약 정보를 가져옵니다.
   *
   * Contest Overall 페이지에서 특정 유저를 선택했을 때 사용
   * https://github.com/skkuding/codedang/pull/1894
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
    return await this.contestService.getContestSubmissionSummaryByUserId(
      take,
      contestId,
      userId,
      problemId,
      cursor
    )
  }

  @Mutation(() => DuplicatedContestResponse)
  async duplicateContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.contestService.duplicateContest(
      groupId,
      contestId,
      req.user.id
    )
  }

  /**
   * Contest에 참여한 User와, 점수 요약을 함께 불러옵니다.
   *
   * Contest Overall 페이지의 Participants 탭의 정보
   * https://github.com/skkuding/codedang/pull/2029
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
    return await this.contestService.getContestScoreSummaries(
      contestId,
      take,
      cursor,
      searchingName
    )
  }

  @Query(() => ContestsGroupedByStatus)
  async getContestsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.contestService.getContestsByProblemId(problemId)
  }
}
