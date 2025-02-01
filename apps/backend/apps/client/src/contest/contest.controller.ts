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
import { GroupIDPipe, IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
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
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.contestService.getContest(id, groupId, req.user?.id)
  }

  @Post(':id/participation')
  async registerContest(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) contestId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    return await this.contestService.registerContest({
      contestId,
      userId: req.user.id,
      invitationCode,
      groupId
    })
  }

  // unregister only for upcoming contest
  @Delete(':id/participation')
  async unregisterContest(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.unregisterContest(
      contestId,
      req.user.id,
      groupId
    )
  }

  @Get(':id/leaderboard')
  async getLeaderboard(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.getContestLeaderboard(
      req.user.id,
      contestId
    )
  }
}
