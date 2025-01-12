import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  DefaultValuePipe,
  Delete
} from '@nestjs/common'
import {
  AuthNotNeededIfOpenSpace,
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfOpenSpace
} from '@libs/auth'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get('ongoing-upcoming')
  @AuthNotNeededIfOpenSpace()
  async getOngoingUpcomingContests(
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.contestService.getContestsByGroupId(groupId)
  }

  @Get('ongoing-upcoming-with-registered')
  async getOngoingUpcomingContestsWithRegistered(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.contestService.getContestsByGroupId(groupId, req.user.id)
  }

  @Get('finished')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getFinishedContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('search') search?: string
  ) {
    return await this.contestService.getFinishedContestsByGroupId(
      req.user?.id,
      cursor,
      take,
      groupId,
      search
    )
  }

  @Get('registered-finished')
  async getRegisteredFinishedContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('search') search?: string
  ) {
    return await this.contestService.getRegisteredFinishedContests(
      cursor,
      take,
      groupId,
      req.user.id,
      search
    )
  }

  @Get('registered-ongoing-upcoming')
  async getRegisteredOngoingUpcomingContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('search') search?: string
  ) {
    return await this.contestService.getRegisteredOngoingUpcomingContests(
      groupId,
      req.user.id,
      search
    )
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
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) contestId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    return await this.contestService.createContestRecord(
      contestId,
      req.user.id,
      invitationCode,
      groupId
    )
  }

  // unregister only for upcoming contest
  @Delete(':id/participation')
  async deleteContestRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) contestId: number
  ) {
    return await this.contestService.deleteContestRecord(
      contestId,
      req.user.id,
      groupId
    )
  }
}
