import { Args, Int, Query, Mutation, Resolver, Context } from '@nestjs/graphql'
import { CourseNotice, Group, GroupType, UserGroup } from '@generated'
import {
  AuthenticatedRequest,
  UseDisableAdminGuard,
  UseGroupLeaderGuard
} from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, IDValidationPipe } from '@libs/pipe'
import {
  GroupService,
  InvitationService,
  WhitelistService,
  CourseNoticeService
} from './group.service'
import {
  CreateCourseNoticeInput,
  UpdateCourseNoticeInput
} from './model/course-notice.input'
import { CourseInput } from './model/group.input'
import { DuplicateCourse, FindGroup } from './model/group.output'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @UseDisableAdminGuard()
  async createCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.createCourse(input, req.user)
  }

  @Mutation(() => Group)
  @UseGroupLeaderGuard()
  async updateCourse(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number,
    @Args('input') input: CourseInput
  ) {
    return await this.groupService.updateCourse(id, input)
  }

  @Mutation(() => Group)
  @UseGroupLeaderGuard()
  async deleteCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.deleteGroup(id, GroupType.Course, req.user)
  }

  @Mutation(() => DuplicateCourse)
  @UseGroupLeaderGuard()
  async duplicateCourse(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.groupService.duplicateCourse(groupId, req.user.id)
  }

  @Query(() => [FindGroup])
  @UseDisableAdminGuard()
  async getCoursesUserLead(@Context('req') req: AuthenticatedRequest) {
    return await this.groupService.getGroupsUserLead(
      req.user.id,
      GroupType.Course
    )
  }

  @Query(() => [FindGroup])
  async getCourses(
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number
  ) {
    return await this.groupService.getCourses(cursor, take)
  }

  @Query(() => FindGroup)
  @UseGroupLeaderGuard()
  async getCourse(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.groupService.getCourse(id)
  }
}

@Resolver(() => CourseNotice)
export class CourseNoticeResolver {
  constructor(private readonly courseNoticeService: CourseNoticeService) {}

  @Mutation(() => CourseNotice)
  async createCourseNotice(
    @Args('input') input: CreateCourseNoticeInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.courseNoticeService.createCourseNotice(req.user.id, input)
  }

  @Mutation(() => CourseNotice)
  async deleteCourseNotice(
    @Args('courseNoticeId', { type: () => Int }, IDValidationPipe)
    courseNoticeId: number
  ) {
    return await this.courseNoticeService.deleteCourseNotice(courseNoticeId)
  }

  @Mutation(() => CourseNotice)
  async updateCourseNotice(
    @Args('courseNoticeId', { type: () => Int }, IDValidationPipe)
    courseNoticeId: number,
    @Args('input') input: UpdateCourseNoticeInput
  ) {
    return await this.courseNoticeService.updateCourseNotice(
      courseNoticeId,
      input
    )
  }

  @Mutation(() => [CourseNotice])
  async cloneCourseNotices(
    @Context('req') req: AuthenticatedRequest,
    @Args('courseNoticeIds', { type: () => [Int] })
    courseNoticeIds: number[],
    @Args('cloneToId', { type: () => Int }, IDValidationPipe)
    cloneToId: number
  ) {
    return await this.courseNoticeService.cloneCourseNotice(
      req.user.id,
      courseNoticeIds,
      cloneToId
    )
  }
}

@Resolver(() => UserGroup)
@UseGroupLeaderGuard()
export class InvitationResolver {
  constructor(private readonly invitationService: InvitationService) {}
  /**
   * Group 초대코드를 발급합니다.
   * @param id 초대코드를 발급하는 Group의 ID
   * @returns 발급된 초대코드
   */
  @Mutation(() => String)
  async issueInvitation(
    @Args('groupId', { type: () => Int }, GroupIDPipe) id: number
  ) {
    return await this.invitationService.issueInvitation(id)
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
    return await this.invitationService.revokeInvitation(id)
  }

  @Mutation(() => UserGroup)
  async inviteUser(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('isGroupLeader', { type: () => Boolean }) isGroupLeader: boolean
  ) {
    return await this.invitationService.inviteUser(
      groupId,
      userId,
      isGroupLeader
    )
  }
}

@Resolver()
@UseGroupLeaderGuard()
export class WhitelistResolver {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Mutation(() => Number)
  async createWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('studentIds', { type: () => [String] }) studentIds: [string]
  ) {
    return await this.whitelistService.createWhitelist(groupId, studentIds)
  }

  @Mutation(() => Number)
  async deleteWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.whitelistService.deleteWhitelist(groupId)
  }

  @Query(() => [String])
  async getWhitelist(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number
  ) {
    return await this.whitelistService.getWhitelist(groupId)
  }
}
