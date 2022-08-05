import {
  Body,
  Controller,
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
import { UserGroupInterface } from './interface/user-group.interface'

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(':group_id')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number
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

  @Get(':group_id/join')
  async getGroupJoinById(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<UserGroupInterface> {
    try {
      return await this.groupService.getGroupJoinById(req.user.id, groupId)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Post('join')
  async getGroupJoinByInvt(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number,
    @Body() invitationCode: string
  ): Promise<UserGroupInterface> {
    try {
      return await this.groupService.getGroupJoinByInvt(
        req.user.id,
        invitationCode
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
