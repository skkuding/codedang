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
import { CourseNoticeOrderPipe } from '@libs/pipe'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'
import { CourseNoticeOrder } from './enum/course_notice-order.enum'
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

  // <TODO>: 권한 검증 추가하기

  /**
   * 특정 강의에 대하여 지정된 개수만큼의 강의 공지 목록을 가져옵니다.
   *
   * @param {AuthenticatedRequest} req
   * @param {number | null} cursor 가져올 공지의 시작점
   * @param {number} take 가져올 공지 수
   * @param {boolean} fixed 고정한 공지를 가져올지 여부
   * @param {number} groupId 강의 아이디
   * @param {string} search 검색할 문자열
   * @param {CourseNoticeOrder} order 공지 정렬 순서
   * @returns 공지에 대한 대략적인 정보와 총 개수
   */
  @Get()
  async getCourseNotices(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('filter', new DefaultValuePipe('all'))
    filter: 'all' | 'unread',
    @Query('search') search?: string,
    @Query('order', CourseNoticeOrderPipe) order?: CourseNoticeOrder
  ) {
    return await this.courseNoticeService.getCourseNotices({
      userId: req.user.id,
      groupId,
      cursor,
      take,
      fixed,
      filter,
      search,
      order
    })
  }

  /**
   * 공지사항의 아이디를 기반으로 공지사항의 내용을 조회합니다.
   *
   * @param {AuthenticatedRequest} req
   * @param {number} id 조회하려는 강의 공지사항의 아이디
   * @returns 현재 조회하려는 공지의 내용과 정보 및 이전/이후 공지 아이디
   */
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

  /**
   * 강의 공지사항의 아이디를 기반으로 해당 공지사항에 대한 댓글을 가져옵니다.
   *
   * @param {number} id 조회하려는 강의 공지사항의 아이디
   * @param {number | null} cursor 가져올 댓글의 시작점
   * @param {number} take 가져올 댓글 수
   * @returns 댓글들의 내용과 대댓글을 가져옵니다. 댓글의 개수는 대댓글을 포함한 총 댓글의 개수입니다.
   */
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

  /**
   * 댓글을 생성합니다.
   *
   * @param {AuthenticatedRequest} req
   * @param {number} id 댓글을 달 강의 공지사항의 아이디
   * @param {CreateCourseNoticeCommentDto} createCourseNoticeCommentDto 댓글 정보 (댓글 내용과 원 댓글의 아이디(선택사항))
   * @returns 생성된 댓글의 정보를 반환합니다.
   */
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

  /**
   * 댓글 내용을 수정합니다.
   *
   * @param {AuthenticatedRequest} req
   * @param {number} id 수정하고자 하는 댓글이 달려있는 강의 공지사항의 아이디
   * @param {number} commentId 댓글의 아이디
   * @param {UpdateCourseNoticeCommentDto} updateCourseNoticeCommentDto 댓글의 수정사항 (수정된 내용)
   * @returns 수정된 댓글의 정보를 반환합니다.
   */
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

  /**
   * 댓글을 1개 삭제합니다.
   *
   * @param {AuthenticatedRequest} req
   * @param {number} id 강의 공지사항의 아이디
   * @param {number} commentId 삭제하려는 댓글 아이디
   * @returns 삭제된 댓글의 내용을 반환합니다.
   */
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
