import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { Group, Role } from '@prisma/client'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { Roles } from 'src/common/decorator/roles.decorator'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupService } from './group.service'
import { GroupMemberGuard } from './guard/group-member.guard'
import { Membership } from './interface/membership.interface'
import { UserGroupInterface } from './interface/user-group.interface'

@Controller('group')
@Roles(Role.User)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async getGroups(): Promise<UserGroupInterface[]> {
    try {
      return await this.groupService.getGroups()
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('joined')
  async getJoinedGroups(
    @Req() req: AuthenticatedRequest
  ): Promise<UserGroupInterface[]> {
    try {
      return await this.groupService.getJoinedGroups(req.user.id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId')
  @UseGuards(GroupMemberGuard)
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Group>> {
    try {
      return await this.groupService.getGroup(groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/join')
  async getGroupJoinById(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<UserGroupInterface> {
    try {
      return await this.groupService.getGroupJoinById(groupId)
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
  ) {
    try {
      return await this.groupService.joinGroupById(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    try {
      return await this.groupService.leaveGroup(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/leaders')
  @UseGuards(GroupMemberGuard)
  async getGroupLeaders(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    try {
      return await this.groupService.getGroupLeaders(groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/members')
  async getGroupMembers(
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    try {
      return await this.groupService.getGroupMembers(groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
