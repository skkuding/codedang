import {
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  AuthenticatedRequest,
  AuthNotNeeded,
  GroupMemberGuard
} from '@libs/auth'
import { ConflictFoundException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { GroupService } from './group.service'

@Controller('group')
export class GroupController {
  private readonly logger = new Logger(GroupController.name)

  constructor(private readonly groupService: GroupService) {}

  @Get()
  @AuthNotNeeded()
  async getGroups(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.groupService.getGroups(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get('joined')
  async getJoinedGroups(@Req() req: AuthenticatedRequest) {
    try {
      return await this.groupService.getJoinedGroups(req.user.id)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId')
  async getGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    try {
      return await this.groupService.getGroup(req.user.id, groupId)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error.message, error.stack)
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
      if (error instanceof ActionNotAllowedException) {
        throw new BadRequestException(error.message)
      }

      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/leaders')
  @UseGuards(GroupMemberGuard)
  async getGroupLeaders(@Param('groupId', ParseIntPipe) groupId: number) {
    try {
      return await this.groupService.getGroupLeaders(groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/members')
  @UseGuards(GroupMemberGuard)
  async getGroupMembers(@Param('groupId', ParseIntPipe) groupId: number) {
    try {
      return await this.groupService.getGroupMembers(groupId)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
