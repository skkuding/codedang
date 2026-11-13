import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseDisableAdminGuard } from '@libs/auth'
import { BlueprintCourseService } from './blueprint-course.service'
import { BlueprintCourseInput } from './model/blueprint-course.input'
import { BlueprintCourseOutput } from './model/blueprint-course.output'

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
}
