// apps/backend/apps/client/src/course/qna/qna.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  ValidationPipe
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
  GetCourseQnAsFilterDto
} from './dto/qna.dto'
import { QnaService } from './qna.service'

@Controller('course/:id/qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Body() createCourseQnADto: CreateCourseQnADto,
    @Query('problemId', OptionalParseIntPipe) problemId?: number
  ) {
    return await this.qnaService.createCourseQnA(
      req.user.id,
      courseId,
      createCourseQnADto,
      problemId
    )
  }

  @Get()
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnAs(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Query(new ValidationPipe({ transform: true }))
    filter: GetCourseQnAsFilterDto
  ) {
    return await this.qnaService.getCourseQnAs(req.user?.id, courseId, filter)
  }

  @Get(':order')
  @UserNullWhenAuthFailedIfPublic()
  async getCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.qnaService.getCourseQnA(req.user?.id, courseId, order)
  }

  @Delete(':order')
  @UseGuards(JwtAuthGuard)
  async deleteCourseQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.qnaService.deleteCourseQnA(req.user.id, courseId, order)
  }

  @Post(':order/comment')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('order', ParseIntPipe) order: number,
    @Body() createCommentDto: CreateCourseQnACommentDto
  ) {
    return await this.qnaService.createCourseQnAComment(
      req.user.id,
      courseId,
      order,
      createCommentDto.content
    )
  }

  @Delete(':qnaOrder/comment/:commentOrder')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) courseId: number,
    @Param('qnaOrder', ParseIntPipe) qnaOrder: number,
    @Param('commentOrder', ParseIntPipe) commentOrder: number
  ) {
    return await this.qnaService.deleteCourseQnAComment(
      req.user.id,
      courseId,
      qnaOrder,
      commentOrder
    )
  }
}
