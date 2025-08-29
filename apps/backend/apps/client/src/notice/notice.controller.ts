import {
  Controller,
  Get,
  Req,
  Query,
  Param,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common'
import { AuthNotNeededIfPublic, AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { NoticeService, type CourseNoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeededIfPublic()
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
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
  async getNoticeByID(@Param('id', new RequiredIntPipe('id')) id: number) {
    return await this.noticeService.getNoticeByID(id)
  }
}

@Controller('course_notice')
export class CourseNoticeController {
  constructor(private readonly courseNoticeService: CourseNoticeService) {}

  // <TODO>: 정렬 순서에 대한 입력이 필요합니다.
  // <TODO>: isRead 속성이 필요할지에 대한 고민... (그냥 읽으면 기록 안읽었으면 undefined)
  // <TODO>: 권한 검증 추가하기
  @Get()
  async getNotices(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('search') search?: string
  ) {
    return await this.courseNoticeService.getNotices({
      userId: req.user.id,
      cursor,
      take,
      fixed,
      search
    })
  }

  // <TODO>: comment의 order가 null이면, orderBy의 기준으로 order를 설정하면 에러가 날까?
  @Get(':id')
  async getNoticeByID(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.courseNoticeService.getNoticeByID({
      userId: req.user.id,
      id,
      cursor,
      take
    })
  }
}
