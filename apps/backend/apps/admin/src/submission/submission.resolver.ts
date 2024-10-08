import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { CursorValidationPipe } from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { ContestSubmission } from './model/contest-submission.model'
import { GetContestSubmissionsInput } from './model/get-contest-submission.input'
import { SubmissionDetail } from './model/submission-detail.output'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  private readonly logger = new Logger(SubmissionResolver.name)
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
    take: number
  ): Promise<ContestSubmission[]> {
    try {
      return await this.submissionService.getContestSubmissions(
        input,
        take,
        cursor
      )
    } catch (error) {
      this.logger.error(error.error)
      throw new InternalServerErrorException()
    }
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
