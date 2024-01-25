import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common'
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
import { AuthenticatedRequest } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe } from '@libs/pipe'
import { Group, Notice, User } from '@admin/@generated'
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
    @Args('groupId', { type: () => Int }, GroupIDPipe)
    groupId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    try {
      return await this.noticeService.createNotice(req.user.id, groupId, input)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Notice)
  async deleteNotice(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('noticeId', { type: () => Int }) noticeId: number
  ) {
    try {
      return await this.noticeService.deleteNotice(groupId, noticeId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Notice)
  async updateNotice(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('input') input: UpdateNoticeInput
  ) {
    try {
      return await this.noticeService.updateNotice(groupId, input)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => Notice)
  async getNotice(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('noticeId', { type: () => Int }) noticeId: number
  ) {
    try {
      return await this.noticeService.getNotice(groupId, noticeId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Notice], { nullable: 'items' })
  async getNotices(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('cursor', { type: () => Int, nullable: true }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { type: () => Int, defaultValue: 10 })
    take: number
  ) {
    try {
      return await this.noticeService.getNotices(groupId, cursor, take)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @ResolveField('createdBy', () => User)
  async getUser(@Parent() notice: Notice) {
    try {
      const { createdById } = notice
      if (createdById == null) {
        return null
      }
      return this.userService.getUser(createdById)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @ResolveField('group', () => Group)
  async getGroup(@Parent() notice: Notice) {
    try {
      const { groupId } = notice
      return this.groupService.getGroupById(groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
