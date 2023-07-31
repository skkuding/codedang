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
  Logger
} from '@nestjs/common'
import { Role } from '@prisma/client'
import {
  AuthenticatedRequest,
  RolesGuard,
  Roles,
  GroupLeaderGuard
} from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { NoticeService } from './notice.service'

@Controller('admin/notice')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class NoticeAdminController {
  private readonly logger = new Logger(NoticeAdminController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getAdminNotices(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.noticeService.getAdminNoticesByGroupId(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('admin/group/:groupId/notice')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class GroupNoticeAdminController {
  private readonly logger = new Logger(GroupNoticeAdminController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createNoticeDto: CreateNoticeDto
  ) {
    try {
      return await this.noticeService.createNotice(
        createNoticeDto,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.noticeService.getAdminNoticesByGroupId(
        cursor,
        take,
        groupId
      )
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getAdminNotice(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.noticeService.getAdminNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticeDto: UpdateNoticeDto
  ) {
    try {
      return await this.noticeService.updateNotice(id, updateNoticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
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
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
