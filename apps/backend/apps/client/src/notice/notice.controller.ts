import {
  Controller,
  Get,
  Query,
  Param,
  Logger,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeededIfOpenSpace()
export class NoticeController {
  private readonly logger = new Logger(NoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('search') search?: string
  ) {
    return await this.noticeService.getNotices({
      cursor,
      take,
      fixed,
      search,
      groupId
    })
  }

  @Get(':id')
  async getNoticeByID(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.noticeService.getNoticeByID(id, groupId)
  }
}
