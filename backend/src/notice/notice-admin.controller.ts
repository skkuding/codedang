import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Req,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  InternalServerErrorException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { RequestNoticeDto } from './dto/request-notice.dto'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

@Controller('admin/notice')
@UseGuards(JwtAuthGuard, GroupManagerGuard)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Body() noticeDto: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.createNotice(req.user.id, noticeDto)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new EntityNotExistException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Req() req: AuthenticatedRequest,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(req.user.id, offset)
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
    @Body() noticeDto: RequestNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, noticeDto)
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
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.noticeService.deleteNotice(id)
  }
}
