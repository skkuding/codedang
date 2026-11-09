import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { CheckRequest } from '@admin/@generated'
import { CheckResolver } from './check.resolver'
import type { CheckService } from './check.service'
import {
  CreatePlagiarismCheckInput,
  CreatePlagiarismTargetsInput
} from './model/create-check.input'

// This Resolver is for Temporary.
@Resolver(() => CheckResolver)
export class CheckAdminResolver {
  constructor(private readonly checkService: CheckService) {}

  @Mutation(() => CheckRequest)
  async checkAssignmentsSubmissions(
    @Args('input', {
      nullable: false,
      type: () => CreatePlagiarismCheckInput
    })
    checkInput: CreatePlagiarismCheckInput,
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('targets', {
      nullable: false,
      type: () => [CreatePlagiarismTargetsInput]
    })
    targetsInput: CreatePlagiarismTargetsInput[]
  ) {}
}
