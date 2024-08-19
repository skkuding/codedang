import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { CursorValidationPipe } from '@libs/pipe'
import { Submission } from '@admin/@generated'
import { ContestSubmissionOverall } from './model/contest-submission-overall.model'
import { GetContestSubmissionOverallInput } from './model/get-contest-submission-overall.input'
import { SubmissionService } from './submission.service'

@Resolver(() => Submission)
export class SubmissionResolver {
  private readonly logger = new Logger(SubmissionResolver.name)
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => [ContestSubmissionOverall])
  async getContestSubmissionOveralls(
    @Args('input', {
      nullable: false,
      type: () => GetContestSubmissionOverallInput
    })
    input: GetContestSubmissionOverallInput,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { nullable: true, defaultValue: 10, type: () => Int })
    take: number
  ): Promise<ContestSubmissionOverall[]> {
    try {
      return await this.submissionService.getContestSubmissionOveralls(
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
