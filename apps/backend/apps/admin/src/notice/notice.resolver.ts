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
import { Group, Notice, User } from '@generated'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, IDValidationPipe } from '@libs/pipe'
import { GroupService } from '@admin/group/group.service'
import { UserService } from '@admin/user/user.service'
import { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

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
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.noticeService.createNotice(req.user.id, groupId, input)
  }

  @Mutation(() => Notice)
  async deleteNotice(
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number
  ) {
    return await this.noticeService.deleteNotice(groupId, noticeId)
  }

  @Mutation(() => Notice)
  async updateNotice(
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number,
    @Args('input') input: UpdateNoticeInput
  ) {
    return await this.noticeService.updateNotice(groupId, noticeId, input)
  }

  @Query(() => Notice)
  async getNotice(
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Args('noticeId', { type: () => Int }, IDValidationPipe) noticeId: number
  ) {
    return await this.noticeService.getNotice(groupId, noticeId)
  }

  @Query(() => [Notice], { nullable: 'items' })
  async getNotices(
    @Args('groupId', { type: () => Int, nullable: true }, GroupIDPipe)
    groupId: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number
  ) {
    return await this.noticeService.getNotices(groupId, cursor, take)
  }

  @ResolveField('createdBy', () => User)
  async getUser(@Parent() notice: Notice) {
    const { createdById } = notice
    if (createdById == null) {
      return null
    }
    return this.userService.getUser(createdById)
  }

  @ResolveField('group', () => Group)
  async getGroup(@Parent() notice: Notice) {
    return this.groupService.getGroupById(notice.groupId)
  }
}
