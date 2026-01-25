import {
  Controller,
  Get,
  Query,
  Param,
  DefaultValuePipe,
  ParseBoolPipe,
  UseGuards
} from '@nestjs/common'
import { AuthNotNeededIfPublic, GroupMemberGuard } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeededIfPublic()
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @UseGuards(GroupMemberGuard)
  async getNotices(
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
      search
    })
  }

  @Get(':id')
  @UseGuards(GroupMemberGuard)
  async getNoticeByID(@Param('id', new RequiredIntPipe('id')) id: number) {
    return await this.noticeService.getNoticeByID(id)
  }
}
