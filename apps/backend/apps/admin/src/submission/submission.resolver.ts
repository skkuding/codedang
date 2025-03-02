import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import {
  SubmissionOrderPipe,
  CursorValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { SubmissionOrder } from './enum/submission-order.enum'
import { AssignmentSubmission } from './model/assignment-submission.model'
import { ContestSubmission } from './model/contest-submission.model'
import {
  GetAssignmentSubmissionsInput,
  GetContestSubmissionsInput
} from './model/get-submissions.input'
import { SubmissionDetail } from './model/submission-detail.output'
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
  @Query(() => SubmissionsWithTotal)
  async getSubmissions(
    @Args('problemId', { type: () => Int }, new RequiredIntPipe('problemId'))
    problemId: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number
  ): Promise<SubmissionsWithTotal> {
    return this.submissionService.getSubmissions(problemId, cursor, take)
  }

  /**
   * 특정 Contest의 모든 제출 내역에 대한 요약을 불러옵니다.
   *
   * Contest Overall page의 'All submission' 탭에서 보여지는 정보를 불러오는 API
   * @see {@link https://github.com/skkuding/codedang/pull/1924}
   */
  @Query(() => [ContestSubmission])
  async getContestSubmissions(
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
  async getAssignmentSubmissions(
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
  async getAssignmentLatestSubmission(
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('problemId', { type: () => Int }) problemId: number
  ): Promise<SubmissionDetail> {
    return await this.submissionService.getAssignmentLatestSubmission(
      assignmentId,
      userId,
      problemId
    )
  }

  /**
   * 특정 제출 내역에 대한 상세 정보를 불러옵니다.
   */
  @Query(() => SubmissionDetail)
  async getSubmission(
    @Args('id', { type: () => Int }) id: number
  ): Promise<SubmissionDetail> {
    return await this.submissionService.getSubmission(id)
  }
}
