// apps/backend/apps/admin/src/course/course.resolver.ts
import { UseGuards } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CourseQnA, CourseQnAComment } from '@generated'
import { AdminGuard, AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { CourseService } from './course.service'
import { UpdateCourseQnAInput } from './model/course-qna.input'

@Resolver(() => CourseQnA)
@UseGuards(AdminGuard)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [CourseQnA])
  async getCourseQnAs(
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number
  ) {
    return await this.courseService.getCourseQnAs(groupId)
  }

  @Query(() => CourseQnA)
  async getCourseQnA(
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number
  ) {
    return await this.courseService.getCourseQnA(groupId, order)
  }

  @Mutation(() => CourseQnA)
  async updateCourseQnA(
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number,
    @Args('input') input: UpdateCourseQnAInput
  ) {
    return await this.courseService.updateCourseQnA(groupId, input)
  }

  @Mutation(() => CourseQnA)
  async deleteCourseQnA(
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number
  ) {
    return await this.courseService.deleteCourseQnA(groupId, order)
  }

  @Mutation(() => CourseQnAComment)
  async createCourseQnAComment(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number,
    @Args('order', { type: () => Int }, IDValidationPipe) order: number,
    @Args('content', { type: () => String }) content: string
  ) {
    return await this.courseService.createCourseQnAComment(
      req.user.id,
      groupId,
      order,
      content
    )
  }

  @Mutation(() => CourseQnAComment)
  async deleteCourseQnAComment(
    @Args('groupId', { type: () => Int }, IDValidationPipe) groupId: number,
    @Args('qnaOrder', { type: () => Int }, IDValidationPipe) qnaOrder: number,
    @Args('commentOrder', { type: () => Int }, IDValidationPipe)
    commentOrder: number
  ) {
    return await this.courseService.deleteCourseQnAComment(
      groupId,
      qnaOrder,
      commentOrder
    )
  }
}
