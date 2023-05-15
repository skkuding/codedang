import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { SubmissionService } from './submission.service'
import { Submission } from './entities/submission.entity'
import { CreateSubmissionInput } from './dto/create-submission.input'
import { UpdateSubmissionInput } from './dto/update-submission.input'

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  @Mutation(() => Submission)
  createSubmission(
    @Args('createSubmissionInput') createSubmissionInput: CreateSubmissionInput
  ) {
    return this.submissionService.create(createSubmissionInput)
  }

  @Query(() => [Submission], { name: 'submission' })
  findAll() {
    return this.submissionService.findAll()
  }

  @Query(() => Submission, { name: 'submission' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.submissionService.findOne(id)
  }

  @Mutation(() => Submission)
  updateSubmission(
    @Args('updateSubmissionInput') updateSubmissionInput: UpdateSubmissionInput
  ) {
    return this.submissionService.update(
      updateSubmissionInput.id,
      updateSubmissionInput
    )
  }

  @Mutation(() => Submission)
  removeSubmission(@Args('id', { type: () => Int }) id: number) {
    return this.submissionService.remove(id)
  }
}
