import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  ValidationPipe
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  AuthNotNeededIfPublic,
  UserNullWhenAuthFailedIfPublic
} from '@libs/auth'
import {
  IDValidationPipe,
  OptionalParseIntPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { ContestService } from './contest.service'
import {
  ContestQnACreateDto,
  GetContestQnAsFilter,
  type ContestQnACommentCreateDto
} from './dto/contest-qna.dto'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}
  @Get()
  @UserNullWhenAuthFailedIfPublic()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Query('search') search: string
  ) {
    return await this.contestService.getContests(req.user?.id, search)
  }

  @Get('banner')
  @AuthNotNeededIfPublic()
  async getContestBanner() {
    return await this.contestService.getBannerContests()
  }

  // @Get('/role')
  // @UserNullWhenAuthFailedIfPublic()
  // async getContestRole(@Req() req: AuthenticatedRequest) {
  //   return await this.contestService.getContestRoles(req.user?.id)
  // }

  @Get(':id')
  @UserNullWhenAuthFailedIfPublic()
  async getContest(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.contestService.getContest(id, req.user?.id)
  }

  @Post(':id/participation')
  async registerContest(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    return await this.contestService.registerContest({
      contestId,
      userId: req.user.id,
      invitationCode
    })
  }

  // unregister only for upcoming contest
  @Delete(':id/participation')
  async unregisterContest(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.unregisterContest(contestId, req.user.id)
  }

  @Get(':id/leaderboard')
  @UserNullWhenAuthFailedIfPublic()
  async getLeaderboard(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Query('search') search: string
  ) {
    return await this.contestService.getContestLeaderboard(
      contestId,
      req.user?.id,
      search
    )
  }

  @Get(':id/qna/:order')
  @UserNullWhenAuthFailedIfPublic()
  async getContestQnAById(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.contestService.getContestQnA(
      req.user?.id,
      contestId,
      order
    )
  }

  @Post(':id/qna')
  async createContestQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Body() contestQnACreateDto: ContestQnACreateDto,
    @Query('problem-order', OptionalParseIntPipe) order?: number
  ) {
    return await this.contestService.createContestQnA(
      contestId,
      req.user.id,
      contestQnACreateDto,
      order
    )
  }

  @Get(':id/qna')
  @UserNullWhenAuthFailedIfPublic()
  async getContestQnAs(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Query(new ValidationPipe({ transform: true })) filter: GetContestQnAsFilter
  ) {
    return await this.contestService.getContestQnAs(
      req.user?.id,
      contestId,
      filter
    )
  }

  @Delete(':id/qna/:order')
  async deleteContestQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('order', ParseIntPipe) order: number
  ) {
    return await this.contestService.deleteContestQnA(
      req.user.id,
      contestId,
      order
    )
  }

  @Post(':id/qna/:order/comment')
  async createContestQnAComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('order', ParseIntPipe) order: number,
    @Body() contentQnACommentCreateDto: ContestQnACommentCreateDto
  ) {
    return await this.contestService.createContestQnAComment(
      req.user.id,
      contestId,
      order,
      contentQnACommentCreateDto.content
    )
  }

  @Delete(':id/qna/:qnaOrder/comment/:commentOrder')
  async deleteContestQnAComment(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('qnaOrder', ParseIntPipe) qnAOrder: number,
    @Param('commentOrder', ParseIntPipe) commentOrder: number
  ) {
    return await this.contestService.deleteContestQnAComment(
      req.user.id,
      contestId,
      qnAOrder,
      commentOrder
    )
  }

  @Get(':id/statistics/problems')
  async getContestProblems(@Param('id', IDValidationPipe) contestId: number) {
    return await this.contestService.getContestProblems(contestId)
  }

  @Get(':id/statistics/problem/:problemId')
  async getStatisticsByProblem(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('problemId', IDValidationPipe) problemId: number
  ) {
    return await this.contestService.getStatisticsByProblem(
      req.user.id,
      contestId,
      problemId
    )
  }
}
