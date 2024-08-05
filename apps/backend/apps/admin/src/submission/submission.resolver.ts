import { Logger } from '@nestjs/common'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { CursorValidationPipe } from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { ContestSubmissionSummary } from './model/contest-submission-summary.model'
import { GetContestSubmissionSummaryInput } from './model/get-contest-submission-summary.input'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  private readonly logger = new Logger(SubmissionResolver.name)
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => [ContestSubmissionSummary])
  async getContestSubmissionSummaries(
    @Args('input', { nullable: false })
    input: GetContestSubmissionSummaryInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number
  ): Promise<ContestSubmissionSummary[]> {
    return await this.submissionService.getContestSubmissionSummaries(
      input,
      take,
      cursor
    )
  }
}
