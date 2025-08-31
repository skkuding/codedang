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
import { Notice, User } from '@generated'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, IDValidationPipe } from '@libs/pipe'
import { UserService } from '@admin/user/user.service'
import { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

@Resolver(() => Notice)
export class NoticeResolver {
  constructor(
    private readonly noticeService: NoticeService,
    private readonly userService: UserService
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
