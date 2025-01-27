import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { SubmissionOrderPipe, CursorValidationPipe } from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { SubmissionOrder } from './enum/submission-order.enum'
import { AssignmentSubmission } from './model/assignment-submission.model'
import { ContestSubmission } from './model/contest-submission.model'
import {
  GetAssignmentSubmissionsInput,
  GetContestSubmissionsInput
} from './model/get-submissions.input'
import { SubmissionDetail } from './model/submission-detail.output'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * 특정 Contest의 모든 제출 내역에 대한 요약을 불러옵니다.
   *
   * Contest Overall page의 'All submission' 탭에서 보여지는 정보를 불러오는 API
   * https://github.com/skkuding/codedang/pull/1924
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
