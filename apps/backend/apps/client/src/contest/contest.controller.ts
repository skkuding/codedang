import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  Delete
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  AuthNotNeededIfOpenSpace,
  UserNullWhenAuthFailedIfOpenSpace
} from '@libs/auth'
import { IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}
  @Get()
  @UserNullWhenAuthFailedIfOpenSpace()
  async getContests(
    @Req() req: AuthenticatedRequest,
    @Query('search') search: string
  ) {
    return await this.contestService.getContests(req.user?.id, search)
  }

  @Get('banner')
  @AuthNotNeededIfOpenSpace()
  async getContestBanner() {
    return await this.contestService.getBannerContests()
  }

  @Get(':id')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getContest(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.contestService.getContest(id, req.user?.id)
  }

  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    return await this.contestService.createContestRecord({
      contestId,
      userId: req.user.id,
      invitationCode
    })
  }

  // unregister only for upcoming contest
  @Delete(':id/participation')
  async deleteContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.deleteContestRecord(contestId, req.user.id)
  }

  @Get(':id/leaderboard')
  @AuthNotNeededIfOpenSpace()
  async getLeaderboard(
    @Param('id', IDValidationPipe) contestId: number,
    @Query('search') search: string
  ) {
    return await this.contestService.getContestLeaderboard(contestId, search)
  }
}
