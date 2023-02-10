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
import { Group, UserGroup } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupService } from './group.service'
import { GroupMemberGuard } from './guard/group-member.guard'
import { GroupData } from './interface/group-data.interface'

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async getGroups(): Promise<GroupData[]> {
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
  ): Promise<GroupData[]> {
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
  ): Promise<GroupData> {
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
  ): Promise<UserGroup> {
    try {
      return await this.groupService.leaveGroup(req.user.id, groupId)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(error.message)
      }
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
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
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
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
