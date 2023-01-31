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
  UnauthorizedException
} from '@nestjs/common'
import { Group } from '@prisma/client'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { GroupService } from './group.service'
import { Membership } from './interface/membership.interface'
import { UserGroupInterface } from './interface/user-group.interface'

@Controller('group')
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

  @Get(':groupId')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Group>> {
    try {
      return await this.groupService.getGroup(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('my')
  async getMyGroups(
    @Req() req: AuthenticatedRequest
  ): Promise<UserGroupInterface[]> {
    try {
      return await this.groupService.getMyGroups(req.user.id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/join')
  async getGroupJoinById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<UserGroupInterface> {
    try {
      return await this.groupService.getGroupJoinById(req.user.id, groupId)
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
  async getGroupLeaders(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    try {
      return await this.groupService.getGroupLeaders(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/members')
  async getGroupMembers(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    try {
      return await this.groupService.getGroupMembers(req.user.id, groupId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
