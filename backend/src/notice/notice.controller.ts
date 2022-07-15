import {
  Controller,
  Get,
  Delete,
  Query,
  Put,
  Post,
  Body,
  Param,
  ParseIntPipe
} from '@nestjs/common'
import { RequestNoticeDto } from './dto/request-notice.dto'
import { NoticeService } from './notice.service'
import { UserNoticePage } from './notice.interface'
import { Notice } from '@prisma/client'

@Controller('notice')
export class PublicNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async findAll(
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.findAll(1, offset)
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<UserNoticePage> {
    return await this.noticeService.findOne(id, 1)
  }
}

@Controller('group/:group_id/notice')
export class GroupNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async findAll(
    @Param('group_id', ParseIntPipe) group_id: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    // TODO: check if the user has access to this group
    return await this.noticeService.findAll(group_id, offset)
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('group_id', ParseIntPipe) group_id: number
  ): Promise<UserNoticePage> {
    // TODO: check if the user has access to this group
    return await this.noticeService.findOne(id, group_id)
  }
}

@Controller('admin/:user_id/notice')
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Param('user_id', ParseIntPipe) userId: number,
    @Body() NoticeData: RequestNoticeDto
  ): Promise<Notice> {
    return await this.noticeService.createNotice(userId, NoticeData)
  }

  @Get()
  async findOwn(
    @Param('user_id', ParseIntPipe) userId: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.findOwn(userId, offset)
  }

  @Get(':id')
  async findDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Notice>> {
    return await this.noticeService.findDetail(id)
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ success: boolean }> {
    return await this.noticeService.delete(id)
  }

  @Put(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() NoticeData: RequestNoticeDto
  ): Promise<Notice> {
    return await this.noticeService.updateNotice(id, NoticeData)
  }
}
