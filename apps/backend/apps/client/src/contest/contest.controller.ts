import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  Delete,
  Body
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  AuthNotNeededIfPublic,
  UserNullWhenAuthFailedIfPublic
} from '@libs/auth'
import { IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { ContestService } from './contest.service'
import { ContestQnACreateDto } from './dto/contest-qna.dto'

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

  @Get('/role')
  @UserNullWhenAuthFailedIfPublic()
  async getContestRole(@Req() req: AuthenticatedRequest) {
    return await this.contestService.getContestRoles(req.user?.id)
  }

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

  @Post(':id/qna')
  async createContestQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Body() contestQnACreateDto: ContestQnACreateDto
  ) {
    return await this.contestService.createContestQnA(
      contestId,
      req.user.id,
      contestQnACreateDto
    )
  }

  @Get(':id/qna')
  @UserNullWhenAuthFailedIfPublic()
  async getContestQnA(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.getContestQnAs(req.user?.id, contestId)
  }

  @Get(':id/qna/:order')
  @UserNullWhenAuthFailedIfPublic()
  async getContestQnAById(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Param('order', IDValidationPipe) order: number
  ) {
    return await this.contestService.getContestQnA(
      req.user?.id,
      contestId,
      order
    )
  }
}
