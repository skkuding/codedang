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

  /**
   * 진행 중인 대회와 진행 예정인 대회를 불러옵니다.
   * 로그인 상태인 경우 유저가 등록한 대회를 함께 불러옵니다.
   */
  @Get('ongoing-upcoming')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getOngoingUpcomingContests(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.contestService.getContestsByGroupId(groupId, req.user?.id)
  }

  /**
   * 진행 중이거나 진행 예정이면서, 유저가 등록한 대회를 불러옵니다.
   * @param search 대회 제목에서 검색할 문자열 (optional)
   */
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

  /**
   * 종료된 대회를 불러옵니다.
   * 유저가 등록했는지 여부를 함께 표시합니다.
   * @param search 대회 제목에서 검색할 문자열 (optional)
   */
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

  /**
   * 종료된 대회 중, 유저가 등록한 대회를 불러옵니다.
   * @param search 대회 제목에서 검색할 문자열 (optional)
   */
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

  /**
   * groupId와 id(contestId)에 맞는 Contest 정보를 불러옵니다.
   * 유저가 등록했는지 여부, 초대코드가 존재하는지 여부를 함께 반환합니다.
   */
  @Get(':id')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getContest(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.contestService.getContest(id, groupId, req.user?.id)
  }

  /**
   * 유저를 Contest에 등록합니다.
   */
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

  /**
   * Contest에 등록된 사용자를 등록 취소합니다.
   * 등록 취소는 아직 시작되지 않은 대회에서만 가능합니다.
   */
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
