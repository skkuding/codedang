import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { CursorValidationPipe } from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { ContestSubmission } from './model/contest-submission.model'
import { GetContestSubmissionsInput } from './model/get-contest-submission.input'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  private readonly logger = new Logger(SubmissionResolver.name)
  constructor(private readonly submissionService: SubmissionService) {}

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
}