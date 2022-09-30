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
  NotFoundException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice, Role } from '@prisma/client'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'

@Controller('admin/notice')
@UseGuards(RolesGuard)
@Roles(Role.Manager)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getAdminNotices(
    @Req() req: AuthenticatedRequest,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(req.user.id, offset)
  }
}

@Controller('admin/group/:groupId/notice')
@UseGuards(RolesGuard, GroupManagerGuard)
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
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNoticesByGroupId(groupId, offset)
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
