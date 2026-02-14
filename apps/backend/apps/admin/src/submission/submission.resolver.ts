import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ContestRole } from '@prisma/client'
import {
  UseContestRolesGuard,
  UseDisableAdminGuard,
  UseGroupLeaderGuard,
  type AuthenticatedRequest
} from '@libs/auth'
import {
  CursorValidationPipe,
  IDValidationPipe,
  RequiredIntPipe,
  SubmissionOrderPipe
} from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { SubmissionOrder } from './enum/submission-order.enum'
import { AssignmentProblemTestcaseResult } from './model/assignment-problem-testcase-results.model'
import { AssignmentSubmission } from './model/assignment-submission.model'
import { ContestSubmission } from './model/contest-submission.model'
import {
  GetAssignmentSubmissionsInput,
  GetContestSubmissionsInput
} from './model/get-submissions.input'
import { RejudgeResult } from './model/rejudge-result.output'
import { RejudgeInput } from './model/rejudge.input'
import { SubmissionDetail } from './model/submission-detail.output'
import { SubmissionResultOutput } from './model/submission-result.model'
import { SubmissionsWithTotal } from './model/submissions-with-total.output'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * Problem의 제출 내역과 제출의 총 개수를 불러옵니다.
   *
   * @param problemId 제출 내역을 조회할 Problem의 ID
   * @param groupId Problem이 속한 Group의 ID
   * @param cursor Pagination을 위한 커서
   * @param take 불러올 제출 내역의 수
   * @returns {SubmissionsWithTotal}
   */
  @UseDisableAdminGuard()
  @Query(() => SubmissionsWithTotal)
  async getSubmissions(
    @Args('problemId', { type: () => Int }, new RequiredIntPipe('problemId'))
    problemId: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number,
    @Context('req') req: AuthenticatedRequest
  ): Promise<SubmissionsWithTotal> {
    return this.submissionService.getSubmissions(
      problemId,
      cursor,
      take,
      req.user
    )
  }

  /**
   * 특정 Contest의 모든 제출 내역에 대한 요약을 불러옵니다.
   *
   * Contest Overall page의 'All submission' 탭에서 보여지는 정보를 불러오는 API
   * @see {@link https://github.com/skkuding/codedang/pull/1924}
   */
  @Query(() => [ContestSubmission])
  @UseContestRolesGuard(ContestRole.Manager)
  async getContestSubmissions(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number,
    @Args('input', {
      nullable: false,
      type: () => GetContestSubmissionsInput
    })
    input: GetContestSubmissionsInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number,
    @Args('order', { nullable: true, type: () => String }, SubmissionOrderPipe)
    order: SubmissionOrder | null
  ): Promise<ContestSubmission[]> {
    return await this.submissionService.getContestSubmissions(
      contestId,
      input,
      take,
      cursor,
      order
    )
  }

  /**
   * 특정 Assignment의 모든 제출 내역에 대한 요약을 불러옵니다.
   *
   * Assignment Overall page의 'All submission' 탭에서 보여지는 정보를 불러오는 API
   * https://github.com/skkuding/codedang/pull/1924
   */
  @Query(() => [AssignmentSubmission])
  @UseGroupLeaderGuard()
  async getAssignmentSubmissions(
    @Args('groupId', { type: () => Int }) _groupId: number,
    @Args('input', {
      nullable: false,
      type: () => GetAssignmentSubmissionsInput
    })
    input: GetAssignmentSubmissionsInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number,
    @Args('order', { nullable: true, type: () => String }, SubmissionOrderPipe)
    order: SubmissionOrder | null
  ): Promise<AssignmentSubmission[]> {
    return await this.submissionService.getAssignmentSubmissions(
      input,
      take,
      cursor,
      order
    )
  }

  @Query(() => SubmissionDetail)
  @UseGroupLeaderGuard()
  async getAssignmentLatestSubmission(
    @Args('groupId', { type: () => Int }) _groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('problemId', { type: () => Int }) problemId: number,
    @Context('req') req: AuthenticatedRequest
  ): Promise<SubmissionDetail> {
    return await this.submissionService.getAssignmentLatestSubmission(
      assignmentId,
      userId,
      problemId,
      req.user.id
    )
  }

  @Query(() => [AssignmentProblemTestcaseResult])
  @UseGroupLeaderGuard()
  async getAssignmentProblemTestcaseResults(
    @Args('groupId', { type: () => Int }) _groupId: number,
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('problemId', { type: () => Int }) problemId: number
  ): Promise<AssignmentProblemTestcaseResult[]> {
    return await this.submissionService.getAssignmentProblemTestcaseResults(
      assignmentId,
      problemId,
      _groupId
    )
  }

  /**
   * 특정 제출 내역에 대한 상세 정보를 불러옵니다.
   */
  @Query(() => SubmissionDetail)
  @UseDisableAdminGuard()
  async getSubmission(
    @Args('id', { type: () => Int }) id: number,
    @Context('req') req: AuthenticatedRequest
  ): Promise<SubmissionDetail> {
    return await this.submissionService.getSubmission(id, req.user.id)
  }
  /**
   * 특정 Assignment의 특정 Problem에 대한 모든 제출을 재채점합니다.
   *
   * @param input 재채점 옵션 (assignmentId, problemId, mode)
   * @param req 요청한 사용자 정보
   * @returns 재채점 결과
   */
  @Mutation(() => RejudgeResult)
  @UseGroupLeaderGuard()
  async rejudgeAssignmentProblem(
    @Args('groupId', { type: () => Int }) _groupId: number,
    @Args('input', { type: () => RejudgeInput })
    input: RejudgeInput,
    @Context('req') req: AuthenticatedRequest
  ): Promise<RejudgeResult> {
    return await this.submissionService.rejudgeAssignmentProblem(
      input,
      req.user
    )
  }

  /**
   * submissionId와 testcaseId를 통해 특정 submissionResult를 불러옵니다.
   * @param submissionId
   * @param testcaseId
   * @returns {SubmissionResultOutput}
   */
  @UseDisableAdminGuard()
  @Query(() => SubmissionResultOutput)
  async getSubmissionResult(
    @Args('submissionId', { type: () => Int }, IDValidationPipe)
    submissionId: number,
    @Args('testcaseId', { type: () => Int }, IDValidationPipe)
    testcaseId: number,
    @Context('req') req: AuthenticatedRequest
  ): Promise<SubmissionResultOutput> {
    return this.submissionService.getSubmissionResult(
      submissionId,
      testcaseId,
      req.user
    )
  }
}
