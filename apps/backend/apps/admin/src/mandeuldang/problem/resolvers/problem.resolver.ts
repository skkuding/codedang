import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { CreateMandeuldangProblemInput } from '../model/problem.input'
import { MandeuldangProblemOutput } from '../model/problem.output'
import { MandeuldangProblemService } from '../services/problem.service'

@Resolver(() => MandeuldangProblemOutput)
@UseDisableAdminGuard()
export class MandeuldangProblemResolver {
  constructor(
    private readonly mandeuldangProblemService: MandeuldangProblemService
  ) {}

  @Mutation(() => MandeuldangProblemOutput)
  async createMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateMandeuldangProblemInput
  ) {
    return await this.mandeuldangProblemService.createProblem(
      input,
      req.user.id
    )
  }
}
