// apps/backend/apps/client/src/course/course.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfPublic
} from '@libs/auth'
import { JwtAuthGuard } from '@libs/auth'
import { IDValidationPipe, OptionalParseIntPipe } from '@libs/pipe'
import {
  CreateCourseQnADto,
  CreateCourseQnACommentDto,
  GetCourseQnAsFilterDto,
  UpdateCourseQnADto
} from '../group/dto/qna.dto'
import { CourseService } from './course.service'

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post(':id/qna')
  @UseGuards(JwtAuthGuard)
  async createCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
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

  @Get(':id/qna')
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnAs(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Query() filter: GetCourseQnAsFilterDto
  ) {
    return await this.courseService.getCourseQnAs(
      req.user?.id,
      courseId,
      filter
    )
  }

  @Get(':id/qna/:order')
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.courseService.getCourseQnA(req.user?.id, courseId, order)
  }

  @Patch(':id/qna/:order')
  @UseGuards(JwtAuthGuard)
  async updateCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
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

  @Delete(':id/qna/:order')
  @UseGuards(JwtAuthGuard)
  async deleteCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.courseService.deleteCourseQnA(
      req.user.id,
      courseId,
      order
    )
  }

  @Post(':id/qna/:order/comment')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
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

  @Delete(':id/qna/:qnaOrder/comment/:commentOrder')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
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
