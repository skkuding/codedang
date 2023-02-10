import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Req,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  InternalServerErrorException,
  NotFoundException,
  DefaultValuePipe
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice, Role } from '@prisma/client'
import { GroupLeaderGuard } from 'src/group/guard/group-leader.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { isPositive } from 'class-validator'

@Controller('admin/notice')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getAdminNotices(
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(cursor, take)
  }
}

@Controller('admin/group/:groupId/notice')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class GroupNoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createNoticeDto: CreateNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.createNotice(
        req.user.id,
        groupId,
        createNoticeDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNoticesByGroupId(
      groupId,
      cursor,
      take
    )
  }

  @Get(':id')
  async getAdminNotice(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Notice>> {
    try {
      return await this.noticeService.getAdminNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticeDto: UpdateNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, updateNoticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteNotice(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.noticeService.deleteNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException('fail to delete')
    }
  }
}
