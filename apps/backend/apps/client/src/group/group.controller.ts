import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common'
import { GroupType } from '@prisma/client'
import {
  AuthenticatedRequest,
  AuthNotNeededIfPublic,
  GroupMemberGuard,
  UserNullWhenAuthFailedIfPublic
} from '@libs/auth'
import {
  CourseNoticeOrderPipe,
  CursorValidationPipe,
  GroupIDPipe,
  OptionalParseIntPipe,
  RequiredIntPipe
} from '@libs/pipe'
import type {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'
import {
  CreateCourseQnADto,
  CreateCourseQnACommentDto,
  GetCourseQnAsFilterDto,
  UpdateCourseQnADto
} from './dto/qna.dto'
import type { CourseNoticeOrder } from './enum/course-notice-order.enum'
import { GroupService, CourseService } from './group.service'

@Controller('group')
export class GroupController {
  private readonly logger = new Logger(GroupController.name)

  constructor(private readonly groupService: GroupService) {}

  @Get()
  @AuthNotNeededIfPublic()
  async getGroups(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.groupService.getGroups(cursor, take)
  }

  @Get('joined')
  async getJoinedGroups(@Req() req: AuthenticatedRequest) {
    return await this.groupService.getJoinedGroups(req.user.id, GroupType.Study)
  }

  @Get(':groupId/leaders')
  @UseGuards(GroupMemberGuard)
  async getGroupLeaders(@Param('groupId', GroupIDPipe) groupId: number) {
    return await this.groupService.getGroupLeaders(groupId)
  }

  @Get(':groupId/members')
  @UseGuards(GroupMemberGuard)
  async getGroupMembers(@Param('groupId', GroupIDPipe) groupId: number) {
    return await this.groupService.getGroupMembers(groupId)
  }
}

@Controller('course')
export class CourseController {
  private readonly logger = new Logger(CourseController.name)

  constructor(
    private readonly groupService: GroupService,
    private readonly courseService: CourseService
  ) {}

  @Get('invite')
  async getCourseByInvitation(
    @Req() req: AuthenticatedRequest,
    @Query('invitation') invitation: string
  ) {
    return await this.groupService.getGroupByInvitation(invitation, req.user.id)
  }

  @Get('joined')
  async getJoinedCourses(@Req() req: AuthenticatedRequest) {
    return await this.groupService.getJoinedGroups(
      req.user.id,
      GroupType.Course
    )
  }

  @Get(':groupId')
  async getCourse(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.groupService.getCourse(groupId, req.user.id)
  }

  @Post(':groupId/join')
  async joinCourseById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Query('invitation') invitation: string
  ) {
    return await this.groupService.joinGroupById(
      req.user.id,
      groupId,
      invitation
    )
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveCourse(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.groupService.leaveGroup(req.user.id, groupId)
  }

  @Get('notice/unreadCount')
  async getUnreadCourseNoticeCount(@Req() req: AuthenticatedRequest) {
    return await this.groupService.getUnreadCourseNoticeCount({
      userId: req.user.id
    })
  }

  @Get('notice/latest')
  async getLatestCourseNotice(@Req() req: AuthenticatedRequest) {
    return await this.groupService.getLatestCourseNotice({
      userId: req.user.id
    })
  }

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
  @Get(':groupId/notice/all')
  async getCourseNotices(
    // <TODO>: GroupMember Guard 무시
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Query('readFilter', new DefaultValuePipe('all'))
    readFilter: 'all' | 'unread',
    @Query('search') search?: string,
    @Query('order', CourseNoticeOrderPipe) order?: CourseNoticeOrder
  ) {
    return await this.groupService.getCourseNotices({
      userId: req.user.id,
      groupId,
      cursor,
      take,
      fixed,
      readFilter,
      search,
      order
    })
  }

  /**
   * 공지사항의 아이디를 기반으로 공지사항의 내용을 조회합니다.
   * <TODO>: 그룹 멤버 가드 적용 안됨
   *
   * @param {AuthenticatedRequest} req
   * @param {number} id 조회하려는 강의 공지사항의 아이디
   * @returns 현재 조회하려는 공지의 내용과 정보 및 이전/이후 공지 아이디
   */
  @Get('notice/:id') // course notice id
  async getCourseNoticeByID(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.groupService.getCourseNoticeByID({
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
  @Get('notice/:id/comment') // course notice id
  async getComments(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.groupService.getCourseNoticeComments({
      id,
      userId: req.user.id,
      userRole: req.user.role,
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
  @Post('notice/:id/comment')
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Body() createCourseNoticeCommentDto: CreateCourseNoticeCommentDto
  ) {
    return await this.groupService.createComment({
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
  @Patch('notice/:id/comment/:commentId')
  async updateComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Param('commentId', new RequiredIntPipe('commentId'))
    commentId: number,
    @Body() updateCourseNoticeCommentDto: UpdateCourseNoticeCommentDto
  ) {
    return await this.groupService.updateComment({
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
  @Delete('notice/:id/comment/:commentId')
  async deleteNoticeComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number,
    @Param('commentId', new RequiredIntPipe('commentId'))
    commentId: number
  ) {
    return await this.groupService.deleteComment({
      userId: req.user.id,
      id,
      commentId
    })
  }

  /**
   * Create a new Q&A for the course.
   * @param req - Authenticated request object containing user info.
   * @param courseId - The ID of the course (Group ID).
   * @param createCourseQnADto - DTO containing title, content, and private setting.
   * @param problemId - (Optional) The ID of the related problem.
   * @returns The created Course Q&A.
   */
  @Post(':id/qna')
  async createCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Body() createCourseQnADto: CreateCourseQnADto,
    @Query('problemId', OptionalParseIntPipe) problemId?: number
  ) {
    return await this.courseService.createCourseQnA(
      req.user.id,
      courseId,
      createCourseQnADto,
      problemId
    )
  }

  /**
   * Get a list of Q&As for the course.
   * @param req - Request object (User is optional if the course is public).
   * @param courseId - The ID of the course.
   * @param filter - Filter options (e.g., specific week, category).
   * @param cursor - Pagination cursor (last QnA ID).
   * @param take - Number of items to retrieve (default: 10).
   * @returns List of Course Q&As.
   */
  @Get(':id/qna')
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnAs(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Query() filter: GetCourseQnAsFilterDto,
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number
  ) {
    return await this.courseService.getCourseQnAs(
      req.user?.id ?? null,
      courseId,
      filter,
      cursor || null,
      take
    )
  }

  /**
   * Get a specific Q&A details.
   * @param req - Request object.
   * @param courseId - The ID of the course.
   * @param order - The order number of the Q&A within the course.
   * @returns Detailed information of the Course Q&A.
   */
  @Get(':id/qna/:order')
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.courseService.getCourseQnA(req.user?.id, courseId, order)
  }

  /**
   * Update an existing Course Q&A.
   * @param req - Authenticated request object.
   * @param courseId - The ID of the course.
   * @param order - The order number of the Q&A to update.
   * @param updateCourseQnADto - DTO containing fields to update.
   * @returns The updated Course Q&A.
   */
  @Patch(':id/qna/:order')
  async updateCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number,
    @Body() updateCourseQnADto: UpdateCourseQnADto
  ) {
    return await this.courseService.updateCourseQnA(
      req.user.id,
      courseId,
      order,
      updateCourseQnADto
    )
  }

  /**
   * Delete a Course Q&A.
   * @param req - Authenticated request object.
   * @param courseId - The ID of the course.
   * @param order - The order number of the Q&A to delete.
   * @returns The result of the deletion.
   */
  @Delete(':id/qna/:order')
  async deleteCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.courseService.deleteCourseQnA(
      req.user.id,
      courseId,
      order
    )
  }

  /**
   * Create a comment for a specific Course Q&A.
   * @param req - Authenticated request object.
   * @param courseId - The ID of the course.
   * @param order - The order number of the Q&A.
   * @param createCommentDto - DTO containing the comment content.
   * @returns The created comment.
   */
  @Post(':id/qna/:order/comment')
  async createQnaComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number,
    @Body() createCommentDto: CreateCourseQnACommentDto
  ) {
    return await this.courseService.createCourseQnAComment(
      req.user.id,
      courseId,
      order,
      createCommentDto.content
    )
  }

  /**
   * Delete a comment from a Course Q&A.
   * @param req - Authenticated request object.
   * @param courseId - The ID of the course.
   * @param qnaOrder - The order number of the Q&A.
   * @param commentOrder - The order number of the comment to delete.
   * @returns The result of the deletion.
   */
  @Delete(':id/qna/:qnaOrder/comment/:commentOrder')
  async deleteQnaComment(
    // 메서드 이름 충돌 방지를 위해 deleteComment -> deleteQnaComment로 변경
    @Req() req: AuthenticatedRequest,
    @Param('id', GroupIDPipe) courseId: number,
    @Param('qnaOrder', ParseIntPipe) qnaOrder: number,
    @Param('commentOrder', ParseIntPipe) commentOrder: number
  ) {
    return await this.courseService.deleteCourseQnAComment(
      req.user.id,
      courseId,
      qnaOrder,
      commentOrder
    )
  }
}
