import {
  Body,
  Controller,
  Get,
  Req,
  Query,
  Post,
  Param,
  DefaultValuePipe,
  ParseBoolPipe,
  Delete,
  Patch
} from '@nestjs/common'
import { AuthNotNeededIfPublic, AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'
import { NoticeService, CourseNoticeService } from './notice.service'

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
  // <TODO>: JS Doc 추가
  // <TODO>: CRUD 테스트
  // <TODO>: Bruno 및 docs 추가
  // <TODO>: TODO 주석 지우기
  @Get()
  async getCourseNotices(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('groupId', new RequiredIntPipe('groupId')) groupId: number,
    @Query('search') search?: string
  ) {
    return await this.courseNoticeService.getCourseNotices({
      userId: req.user.id,
      groupId,
      cursor,
      take,
      fixed,
      search
    })
  }

  @Get(':id') // course notice id
  async getCourseNoticeByID(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.courseNoticeService.getCourseNoticeByID({
      userId: req.user.id,
      id
    })
  }

  @Get(':id/comment') // course notice id
  async getComments(
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.courseNoticeService.getCourseNoticeComments({
      id,
      cursor,
      take
    })
  }

  @Post(':id/comment')
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Body() createCourseNoticeCommentDto: CreateCourseNoticeCommentDto
  ) {
    return await this.courseNoticeService.createComment({
      userId: req.user.id,
      id,
      createCourseNoticeCommentDto
    })
  }

  @Patch(':id/comment/:commentId')
  async updateComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Param('commentId', new RequiredIntPipe('commentId'))
    commentId: number,
    @Body() updateCourseNoticeCommentDto: UpdateCourseNoticeCommentDto
  ) {
    return await this.courseNoticeService.updateComment({
      userId: req.user.id,
      id,
      commentId,
      updateCourseNoticeCommentDto
    })
  }

  @Delete(':id/comment/:commentId')
  async deleteComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Param('commentId', new RequiredIntPipe('commentId'))
    commentId: number
  ) {
    return await this.courseNoticeService.deleteComment({
      userId: req.user.id,
      id,
      commentId
    })
  }
}
