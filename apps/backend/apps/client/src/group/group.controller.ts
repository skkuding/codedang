import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  AuthNotNeededIfOpenSpace,
  GroupMemberGuard
} from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { GroupService } from './group.service'

@Controller('group')
export class GroupController {
  private readonly logger = new Logger(GroupController.name)

  constructor(private readonly groupService: GroupService) {}

  @Get()
  @AuthNotNeededIfOpenSpace()
  async getGroups(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.groupService.getGroups(cursor, take)
  }

  @Get('joined')
  async getJoinedGroups(@Req() req: AuthenticatedRequest) {
    return await this.groupService.getJoinedGroups(req.user.id)
  }

  @Get(':groupId')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.groupService.getGroup(groupId, req.user.id)
  }

  @Get('invite/:invitation')
  async getGroupByInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('invitation') invitation: string
  ) {
    return await this.groupService.getGroupByInvitation(invitation, req.user.id)
  }

  @Post(':groupId/join')
  async joinGroupById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Query('invitation') invitation?: string
  ) {
    return await this.groupService.joinGroupById(
      req.user.id,
      groupId,
      invitation
    )
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.groupService.leaveGroup(req.user.id, groupId)
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
