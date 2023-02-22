import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { AuthNotNeeded } from 'src/common/decorator/auth-ignore.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { UserNotice } from './interface/user-notice.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { CursorValidationPipe } from '../common/pipe/cursor-validation.pipe'

@Controller('notice')
@AuthNotNeeded()
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getNoticesByGroupId(cursor, take)
  }

  @Get(':id')
  async getNotice(@Param('id', ParseIntPipe) id: number): Promise<UserNotice> {
    try {
      return await this.noticeService.getNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/notice')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('')
  async getNotices(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getNoticesByGroupId(cursor, take, groupId)
  }

  @Get(':id')
  async getNotice(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<UserNotice> {
    try {
      return await this.noticeService.getNotice(id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
