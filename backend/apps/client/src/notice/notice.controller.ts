import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { AuthNotNeeded, RolesGuard, GroupMemberGuard } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeeded()
export class NoticeController {
  private readonly logger = new Logger(NoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.noticeService.getNoticesByGroupId(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNotice(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.noticeService.getNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/notice')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupNoticeController {
  private readonly logger = new Logger(GroupNoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.noticeService.getNoticesByGroupId(cursor, take, groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNotice(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.noticeService.getNotice(id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
