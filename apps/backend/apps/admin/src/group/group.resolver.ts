import { SetMetadata } from '@nestjs/common'
import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { Group, GroupType, UserGroup } from '@generated'
import {
  AuthenticatedRequest,
  LEADER_NOT_NEEDED_KEY,
  UseRolesGuard
} from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { GroupService } from './group.service'
import { CourseInput } from './model/group.input'
import { CanCreateCourseResult, FindGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @SetMetadata(LEADER_NOT_NEEDED_KEY, true)
  async createCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.createCourse(input, req.user)
  }

  @Mutation(() => Group)
  async updateCourse(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.updateCourse(id, input)
  }

  @Mutation(() => Group)
  async deleteCourse(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.deleteGroup(id, GroupType.Course)
  }

  @Mutation(() => CanCreateCourseResult)
  @UseRolesGuard()
  async updateCanCreateCourse(
    @Args('userId', { type: () => Int }, new RequiredIntPipe('userId'))
    userId: number,
    @Args('canCreateCourse', { type: () => Boolean }) canCreateCourse: boolean
  ) {
    return await this.groupService.updateCanCreateCourse(
      userId,
      canCreateCourse
    )
  }

  @Query(() => [FindGroup])
  @SetMetadata(LEADER_NOT_NEEDED_KEY, true)
  async getCoursesUserLead(@Context('req') req: AuthenticatedRequest) {
    return await this.groupService.getGroupsUserLead(
      req.user.id,
      GroupType.Course
    )
  }

  @Query(() => [FindGroup])
  @UseRolesGuard()
  async getCourses(
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number
  ) {
    return await this.groupService.getCourses(cursor, take)
  }

  @Query(() => FindGroup)
  async getCourse(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.getCourse(id)
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

  @Mutation(() => UserGroup)
  async inviteUser(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('isGroupLeader', { type: () => Boolean }) isGroupLeader: boolean
  ) {
    return await this.groupService.inviteUser(groupId, userId, isGroupLeader)
  }

  @Mutation(() => UserGroup)
  async kickUser(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }) userId: number
  ) {
    return await this.groupService.kickUser(groupId, userId)
  }

  @Mutation(() => UserGroup)
  async updateIsGroupLeader(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('isGroupLeader', { type: () => Boolean }) isGroupLeader: boolean
  ) {
    return await this.groupService.updateIsGroupLeader(
      groupId,
      userId,
      isGroupLeader
    )
  }

  @Mutation(() => Number)
  async createWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('studentIds', { type: () => [String] }) studentIds: [string]
  ) {
    return await this.groupService.createWhitelist(groupId, studentIds)
  }

  @Mutation(() => Number)
  async deleteWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.groupService.deleteWhitelist(groupId)
  }

  @Query(() => [String])
  async getWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.groupService.getWhitelist(groupId)
  }
}
