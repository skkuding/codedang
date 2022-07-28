import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Req,
  Res,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { RequestNoticeDto } from './dto/request-notice.dto'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

@Controller('admin/notice')
@UseGuards(JwtAuthGuard)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getAdminNotices(
    @Req() req: AuthenticatedRequest,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(req.user.id, offset)
  }

  @Get(':id')
  async redirect(
    @Res() res,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Notice>> {
    try {
      const groupId = (await this.noticeService.getGroup(id)).group_id
      return res.redirect('admin/group/' + groupId + 'notice/' + id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Put(':id')
  async updateNotice(): Promise<void> {
    // TODO: visible 수정 기능 구현
  }

  @Delete(':group_id/:id')
  @UseGuards(GroupManagerGuard)
  async deleteNotice(
    @Param('group_id') groupId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
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

@Controller('admin/group/:group_id/notice')
@UseGuards(JwtAuthGuard, GroupManagerGuard)
export class GroupNoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Body() noticeDto: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.createNotice(req.user.id, noticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Param('group_id', ParseIntPipe) groupId: number,
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

  // TODO: fixed/visible 수정하는 함수 추가 구현
  @Put(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() noticeDto: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, noticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableDataException(error.message)
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
