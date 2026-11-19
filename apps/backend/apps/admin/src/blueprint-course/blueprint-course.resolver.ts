import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { BlueprintCourseService } from './blueprint-course.service'
import {
  BlueprintCourseInput,
  UpdateBlueprintCourseInput
} from './model/blueprint-course.input'
import {
  BlueprintCourseDetailOutput,
  BlueprintCourseListItemOutput,
  BlueprintCourseOutput
} from './model/blueprint-course.output'

@Resolver(() => BlueprintCourseOutput)
export class BlueprintCourseResolver {
  constructor(
    private readonly blueprintCourseService: BlueprintCourseService
  ) {}

  /**
   * AdminGuard를 해제해 일반 User(교수, 조교)도 호출할 수 있게 합니다.
   * 인가는 서비스의 canCreateCourse 검사가 담당합니다.
   */
  @Mutation(() => BlueprintCourseOutput)
  @UseDisableAdminGuard()
  async createBlueprintCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: BlueprintCourseInput
  ) {
    return await this.blueprintCourseService.createBlueprintCourse(
      input,
      req.user
    )
  }

  /**
   * @return Blueprint courses created or led by the authenticated user.
   */
  @Query(() => [BlueprintCourseListItemOutput])
  @UseDisableAdminGuard()
  async getBlueprintCourses(@Context('req') req: AuthenticatedRequest) {
    return await this.blueprintCourseService.getBlueprintCourses(req.user.id)
  }

  /**
   * @return details for a Blueprint course accessible to the user.
   */
  @Query(() => BlueprintCourseDetailOutput)
  @UseDisableAdminGuard()
  async getBlueprintCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int })
    blueprintCourseId: number
  ) {
    return await this.blueprintCourseService.getBlueprintCourse(
      blueprintCourseId,
      req.user
    )
  }

  /**
   * Blueprint 강좌를 수정하고 공통 필드를 모든 Section에 반영합니다.
   * 인가는 서비스의 Blueprint leader 검사가 담당합니다.
   *
   * @return the updated Blueprint course.
   */
  @Mutation(() => BlueprintCourseOutput)
  @UseDisableAdminGuard()
  async updateBlueprintCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('blueprintCourseId', { type: () => Int })
    blueprintCourseId: number,
    @Args('input') input: UpdateBlueprintCourseInput
  ) {
    return await this.blueprintCourseService.updateBlueprintCourse(
      blueprintCourseId,
      input,
      req.user
    )
  }
}
