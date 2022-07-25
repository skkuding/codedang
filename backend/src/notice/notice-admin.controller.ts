import {
  Controller,
  Get,
  Delete,
  Query,
  Put,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  InternalServerErrorException
} from '@nestjs/common'
import { RequestNoticeDto } from './dto/request-notice.dto'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

@Controller('admin/:user_id/notice')
@UseGuards(JwtAuthGuard)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Body() NoticeData: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.createNotice(req.user.id, NoticeData)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new EntityNotExistException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Param('user_id', ParseIntPipe) userId: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(userId, offset)
  }

  @Get(':id')
  async getAdminNotice(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Notice>> {
    return await this.noticeService.getAdminNotice(id)
  }

  @Put(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() NoticeData: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, NoticeData)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new EntityNotExistException(err.message)
      }
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableDataException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ success: boolean }> {
    return await this.noticeService.deleteNotice(id)
  }
}
