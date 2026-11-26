import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { CursorValidationPipe, IDValidationPipe } from '@libs/pipe'
import { BlueprintNoticeService } from './blueprint-notice.service'
import { CreateBlueprintNoticeInput } from './model/blueprint-notice.input'
import { BlueprintNoticeOutput } from './model/blueprint-notice.output'

/**
 * A blueprint has no groupId and cannot use GroupLeaderGuard, so this resolver
 * disables AdminGuard and authorizes with the blueprint leader check in the service.
 */
@Resolver(() => BlueprintNoticeOutput)
@UseDisableAdminGuard()
export class BlueprintNoticeResolver {
  constructor(private readonly service: BlueprintNoticeService) {}

  @Mutation(() => BlueprintNoticeOutput)
  async createBlueprintNotice(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int }, IDValidationPipe)
    blueprintCourseId: number,
    @Args('input') input: CreateBlueprintNoticeInput
  ) {
    return await this.service.createNotice(req.user, blueprintCourseId, input)
  }

  @Query(() => [BlueprintNoticeOutput])
  async getBlueprintNotices(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int }, IDValidationPipe)
    blueprintCourseId: number,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor?: number | null,
    @Args('search', { nullable: true }) search?: string
  ) {
    return await this.service.getNotices(
      req.user,
      blueprintCourseId,
      take,
      cursor,
      search
    )
  }

  @Query(() => BlueprintNoticeOutput)
  async getBlueprintNotice(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintNoticeId', { type: () => Int }, IDValidationPipe)
    blueprintNoticeId: number
  ) {
    return await this.service.getNoticeById(req.user, blueprintNoticeId)
  }
}
