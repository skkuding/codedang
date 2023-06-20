import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { type UserGroup } from '@prisma/client'
import { type AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'
import { AuthNotNeeded } from '@client/common/decorator/auth-ignore.decorator'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from '@client/common/exception/business.exception'
import { CursorValidationPipe } from '@client/common/pipe/cursor-validation.pipe'
import { GroupService } from './group.service'
import { GroupMemberGuard } from './guard/group-member.guard'
import { type GroupData } from './interface/group-data.interface'

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @AuthNotNeeded()
  async getGroups(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<GroupData[]> {
    try {
      return await this.groupService.getGroups(cursor, take)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('joined')
  async getJoinedGroups(
    @Req() req: AuthenticatedRequest
  ): Promise<GroupData[]> {
    try {
      return await this.groupService.getJoinedGroups(req.user.id)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<GroupData>> {
    try {
      return await this.groupService.getGroup(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Post(':groupId/join')
  async joinGroupById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<{ userGroupData: Partial<UserGroup>; isJoined: boolean }> {
    try {
      return await this.groupService.joinGroupById(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ActionNotAllowedException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<UserGroup> {
    try {
      return await this.groupService.leaveGroup(req.user.id, groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/leaders')
  @UseGuards(GroupMemberGuard)
  async getGroupLeaders(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<string[]> {
    try {
      return await this.groupService.getGroupLeaders(groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/members')
  @UseGuards(GroupMemberGuard)
  async getGroupMembers(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<string[]> {
    try {
      return await this.groupService.getGroupMembers(groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
