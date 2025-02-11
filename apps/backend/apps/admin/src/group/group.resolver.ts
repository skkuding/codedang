import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { Group, GroupType } from '@generated'
import { Role } from '@prisma/client'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe } from '@libs/pipe'
import { GroupService } from './group.service'
import { CourseInput } from './model/group.input'
import { FindGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @UseRolesGuard(Role.User)
  async createCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.createCourse(input, req.user)
  }

  @Query(() => [FindGroup])
  @UseRolesGuard()
  async getGroups(
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number
  ) {
    return await this.groupService.getGroups(cursor, take)
  }

  @Query(() => [FindGroup])
  @UseRolesGuard(Role.User)
  async getCoursesUserLead(@Context('req') req: AuthenticatedRequest) {
    return await this.groupService.getGroupsUserLead(
      req.user.id,
      GroupType.Course
    )
  }

  @Query(() => FindGroup)
  async getGroup(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.getGroup(id)
  }

  @Mutation(() => Group)
  async updateCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.updateCourse(id, input, req.user)
  }

  @Mutation(() => Group)
  @UseRolesGuard(Role.User)
  async deleteCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.deleteGroup(id, req.user, GroupType.Study)
  }

  /**
   * Group 초대코드를 발급합니다.
   * @param id 초대코드를 발급하는 Group의 ID
   * @returns 발급된 초대코드
   */
  @Mutation(() => String)
  async issueInvitation(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.issueInvitation(id)
  }

  /**
   * 발급했던 Group 초대코드를 제거합니다.
   * @param id 초대코드를 제거하는 Group의 ID
   * @returns 제거된 초대코드
   */
  @Mutation(() => String)
  async revokeInvitation(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.revokeInvitation(id)
  }
}
