import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseIntPipe,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, GroupLeaderGuard } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { Notice } from '@admin/@generated'
import { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

@Resolver(() => Notice)
export class NoticeResolver {
  private readonly logger = new Logger(NoticeResolver.name)
  constructor(private readonly noticeService: NoticeService) {}

  @Mutation(() => Notice)
  @UseGuards(GroupLeaderGuard)
  async createNotice(
    @Args('input') input: CreateNoticeInput,
    @Args('groupId', ParseIntPipe)
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
  @UseGuards(GroupLeaderGuard)
  async deleteNotice(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('noticeId', ParseIntPipe) noticeId: number
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
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('input') input: UpdateNoticeInput
  ) {
    try {
      return await this.noticeService.updateContest(groupId, input)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
