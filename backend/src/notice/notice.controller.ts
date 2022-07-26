import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { UserNotice } from './interface/user-notice.interface'

@Controller('notice')
export class PublicNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getNoticesByGroupId(1, offset)
  }

  @Get(':id')
  async getNotice(@Param('id', ParseIntPipe) id: number): Promise<UserNotice> {
    return await this.noticeService.getNotice(id, 1)
  }
}

@Controller('group/:group_id/notice')
export class GroupNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Param('group_id', ParseIntPipe) group_id: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    // TODO: check if the user has access to this group
    return await this.noticeService.getNoticesByGroupId(group_id, offset)
  }

  @Get(':id')
  async getNotice(
    @Param('id', ParseIntPipe) id: number,
    @Param('group_id', ParseIntPipe) group_id: number
  ): Promise<UserNoticePage> {
    // TODO: check if the user has access to this group
    return await this.noticeService.getNotice(id, group_id)
  }
}
