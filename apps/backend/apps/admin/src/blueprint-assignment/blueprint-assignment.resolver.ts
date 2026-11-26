import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { BlueprintAssignmentService } from './blueprint-assignment.service'
import { CreateBlueprintAssignmentInput } from './model/blueprint-assignment.input'
import { BlueprintAssignmentOutput } from './model/blueprint-assignment.output'

@Resolver(() => BlueprintAssignmentOutput)
@UseDisableAdminGuard()
export class BlueprintAssignmentResolver {
  constructor(private readonly service: BlueprintAssignmentService) {}

  @Mutation(() => BlueprintAssignmentOutput)
  createBlueprintAssignment(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int }, IDValidationPipe)
    blueprintCourseId: number,
    @Args('input') input: CreateBlueprintAssignmentInput
  ) {
    return this.service.save(req.user, blueprintCourseId, input)
  }
}
