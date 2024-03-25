import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  AuthenticatedRequest,
  AuthNotNeededIfOpenSpace,
  GroupMemberGuard
} from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
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
    try {
      return await this.groupService.getGroups(cursor, take)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('joined')
  async getJoinedGroups(@Req() req: AuthenticatedRequest) {
    try {
      return await this.groupService.getJoinedGroups(req.user.id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.groupService.getGroup(groupId, req.user.id)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('invite/:invitation')
  async getGroupByInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('invitation') invitation: string
  ) {
    try {
      return await this.groupService.getGroupByInvitation(
        invitation,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException('Invalid invitation')
      } else if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post(':groupId/join')
  async joinGroupById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Query('invitation') invitation?: string
  ) {
    try {
      return await this.groupService.joinGroupById(
        req.user.id,
        groupId,
        invitation
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (
        error instanceof ForbiddenAccessException ||
        error instanceof ConflictFoundException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.groupService.leaveGroup(req.user.id, groupId)
    } catch (error) {
      if (error instanceof ConflictFoundException) {
        throw error.convert2HTTPException()
      }

      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/leaders')
  @UseGuards(GroupMemberGuard)
  async getGroupLeaders(@Param('groupId', GroupIDPipe) groupId: number) {
    try {
      return await this.groupService.getGroupLeaders(groupId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/members')
  @UseGuards(GroupMemberGuard)
  async getGroupMembers(@Param('groupId', GroupIDPipe) groupId: number) {
    try {
      return await this.groupService.getGroupMembers(groupId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
