import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { UpdateMandeuldangProblemInput } from '../model/problem.input'
import { MandeuldangProblemOutput } from '../model/problem.output'
import { MandeuldangProblemService } from '../services/problem.service'

@Resolver(() => MandeuldangProblemOutput)
@UseDisableAdminGuard()
export class MandeuldangProblemResolver {
  constructor(private readonly problemService: MandeuldangProblemService) {}

  @Mutation(() => MandeuldangProblemOutput)
  async updateMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: UpdateMandeuldangProblemInput
  ) {
    return await this.problemService.updateProblem(input, req.user.id)
  }

  @Mutation(() => MandeuldangProblemOutput)
  async publishMandeuldangProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.problemService.publishProblem(id, req.user.id)
  }
}
