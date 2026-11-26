import { Args, Context, Int, Mutation, Resolver, Query } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { IDValidationPipe, CursorValidationPipe } from '@libs/pipe'
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

  @Query(() => [BlueprintAssignmentOutput])
  getBlueprintAssignments(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int }, IDValidationPipe)
    blueprintCourseId: number,
    @Args('isExercise', { defaultValue: false }) isExercise: boolean,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor?: number,
    @Args('search', { nullable: true }) search?: string
  ) {
    return this.service.getAssignments(
      req.user,
      blueprintCourseId,
      isExercise,
      take,
      cursor,
      search
    )
  }

  @Query(() => BlueprintAssignmentOutput)
  getBlueprintAssignment(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintAssignmentId', { type: () => Int }, IDValidationPipe)
    id: number
  ) {
    return this.service.getAssignmentById(req.user, id)
  }
}
