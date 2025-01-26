import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import {
  ContestSubmissionOrderPipe,
  CursorValidationPipe,
  GroupIDPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { ContestSubmissionOrder } from './enum/contest-submission-order.enum'
import { ContestSubmission } from './model/contest-submission.model'
import { GetContestSubmissionsInput } from './model/get-contest-submission.input'
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
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number
  ): Promise<SubmissionsWithTotal> {
    return this.submissionService.getSubmissions(
      problemId,
      groupId,
      cursor,
      take
    )
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
    @Args(
      'order',
      { nullable: true, type: () => String },
      ContestSubmissionOrderPipe
    )
    order: ContestSubmissionOrder | null
  ): Promise<ContestSubmission[]> {
    return await this.submissionService.getContestSubmissions(
      input,
      take,
      cursor,
      order
    )
  }

  /**
   * 특정 Contest의 특정 제출 내역에 대한 상세 정보를 불러옵니다.
   */
  @Query(() => SubmissionDetail)
  async getSubmission(
    @Args('id', { type: () => Int }) id: number
  ): Promise<SubmissionDetail> {
    return await this.submissionService.getSubmission(id)
  }
}
