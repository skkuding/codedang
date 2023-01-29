import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
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

  @Get('all')
  async getAllGroups(): Promise<UserGroupInterface[]> {
    try {
      return await this.groupService.getAllGroups()
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
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

  @Get(':invitationCode/join')
  async getGroupJoinByInvt(
    @Req() req: AuthenticatedRequest,
    @Param('invitationCode') invitationCode: string
  ): Promise<UserGroupInterface> {
    try {
      return await this.groupService.getGroupJoinByInvt(
        req.user.id,
        invitationCode
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/managers')
  async getGroupManagers(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Membership[]> {
    try {
      return await this.groupService.getGroupManagers(req.user.id, groupId)
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
