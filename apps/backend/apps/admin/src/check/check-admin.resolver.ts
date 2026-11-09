import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import type { AuthenticatedRequest } from '@libs/auth'
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
    @Context('req') req: AuthenticatedRequest,
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
    targets: CreatePlagiarismTargetsInput[]
  ) {
    return await this.checkService.checkAssignmentsProblem({
      user: req.user,
      checkInput,
      problemId,
      targets
    })
  }
}
