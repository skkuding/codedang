import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { RequiredIntPipe } from '@libs/pipe'
import { BlueprintAssignmentProblemService } from './blueprint-assignment-problem.service'
import { BlueprintAssignmentProblemInput } from './model/blueprint-assignment-problem.input'
import { BlueprintAssignmentProblemOutput } from './model/blueprint-assignment-problem.output'

@Resolver(() => BlueprintAssignmentProblemOutput)
@UseDisableAdminGuard()
export class BlueprintAssignmentProblemResolver {
  constructor(
    private readonly blueprintAssignmentProblemService: BlueprintAssignmentProblemService
  ) {}

  @Query(() => [BlueprintAssignmentProblemOutput])
  async getBlueprintAssignmentProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'blueprintAssignmentId',
      { type: () => Int },
      new RequiredIntPipe('blueprintAssignmentId')
    )
    blueprintAssignmentId: number
  ) {
    return await this.blueprintAssignmentProblemService.getBlueprintAssignmentProblems(
      req.user,
      blueprintAssignmentId
    )
  }

  @Mutation(() => [BlueprintAssignmentProblemOutput])
  async importProblemsToBlueprintAssignment(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'blueprintAssignmentId',
      { type: () => Int },
      new RequiredIntPipe('blueprintAssignmentId')
    )
    blueprintAssignmentId: number,
    @Args('problems', { type: () => [BlueprintAssignmentProblemInput] })
    problems: BlueprintAssignmentProblemInput[]
  ) {
    return await this.blueprintAssignmentProblemService.importProblemsToBlueprintAssignment(
      req.user,
      blueprintAssignmentId,
      problems
    )
  }
}
