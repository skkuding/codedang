import { Logger } from '@nestjs/common'
import {
  Args,
  Context,
  Int,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { CourseNotice, Notice, User } from '@generated'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, IDValidationPipe } from '@libs/pipe'
import { GroupService } from '@admin/group/group.service'
import { UserService } from '@admin/user/user.service'
import type {
  CreateCourseNoticeInput,
  UpdateCourseNoticeInput
} from './model/courseNotice.input'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { CourseNoticeService, NoticeService } from './notice.service'

@Resolver(() => Notice)
export class NoticeResolver {
  private readonly logger = new Logger(NoticeResolver.name)
  constructor(
    private readonly noticeService: NoticeService,
    private readonly userService: UserService,
    private readonly groupService: GroupService
  ) {}

  @Mutation(() => Notice)
  async createNotice(
    @Args('input') input: CreateNoticeInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.noticeService.createNotice(req.user.id, input)
  }

  @Mutation(() => Notice)
  async deleteNotice(
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number
  ) {
    return await this.noticeService.deleteNotice(noticeId)
  }

  @Mutation(() => Notice)
  async updateNotice(
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number,
    @Args('input') input: UpdateNoticeInput
  ) {
    return await this.noticeService.updateNotice(noticeId, input)
  }

  @Query(() => Notice)
  async getNotice(
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number
  ) {
    return await this.noticeService.getNotice(noticeId)
  }

  @Query(() => [Notice], { nullable: 'items' })
  async getNotices(
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number
  ) {
    return await this.noticeService.getNotices(cursor, take)
  }

  @ResolveField('createdBy', () => User, { nullable: true })
  async getUser(@Parent() notice: Notice) {
    const { createdById } = notice
    if (createdById == null) {
      return null
    }
    return this.userService.getUser(createdById)
  }
}

// <TODO>: 권한 검증이 필요합니다.
@Resolver(() => CourseNotice)
export class CourseNoticeResolver {
  private readonly logger = new Logger(CourseNoticeService.name)
  constructor(private readonly courseNoticeService: CourseNoticeService) {}

  @Mutation(() => Notice)
  async createNotice(
    @Args('input') input: CreateCourseNoticeInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.courseNoticeService.createNotice(req.user.id, input)
  }

  @Mutation(() => Notice)
  async deleteNotice(
    @Args('courseNoticeId', { type: () => Int }, IDValidationPipe)
    courseNoticeId: number
  ) {
    return await this.courseNoticeService.deleteNotice(courseNoticeId)
  }

  @Mutation(() => Notice)
  async updateNotice(
    @Args('courseNoticeId', { type: () => Int }, IDValidationPipe)
    courseNoticeId: number,
    @Args('input') input: UpdateCourseNoticeInput
  ) {
    return await this.courseNoticeService.updateNotice(courseNoticeId, input)
  }

  @Mutation(() => Notice)
  async cloneNotice(
    @Context('req') req: AuthenticatedRequest,
    @Args('courseNoticeId', { type: () => Int }, IDValidationPipe)
    courseNoticeId: number,
    @Args('cloneToId', { type: () => Int }, IDValidationPipe)
    cloneToId: number,
    @Args('input', { defaultValue: {} }) input: UpdateCourseNoticeInput
  ) {
    return await this.courseNoticeService.cloneNotice(
      req.user.id,
      courseNoticeId,
      input,
      cloneToId
    )
  }
}
