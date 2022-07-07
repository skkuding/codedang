import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe
} from '@nestjs/common'
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

@Controller('admin/:id/notice')
export class AdminNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async findOwn(
    @Param('id', ParseIntPipe) id: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.findOwn(id, offset)
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
}
