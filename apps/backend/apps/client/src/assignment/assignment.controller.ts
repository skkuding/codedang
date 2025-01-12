import {
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  Get,
  Query,
  Logger,
  DefaultValuePipe,
  Delete
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  AuthNotNeededIfOpenSpace,
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfOpenSpace
} from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { AssignmentService } from './assignment.service'

@Controller('assignment')
export class AssignmentController {
  private readonly logger = new Logger(AssignmentController.name)

  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('ongoing-upcoming')
  @AuthNotNeededIfOpenSpace()
  async getOngoingUpcomingAssignments(
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.assignmentService.getAssignmentsByGroupId(groupId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('ongoing-upcoming-with-registered')
  async getOngoingUpcomingAssignmentsWithRegistered(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.assignmentService.getAssignmentsByGroupId(
        groupId,
        req.user.id
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('finished')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getFinishedAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('search') search?: string
  ) {
    try {
      return await this.assignmentService.getFinishedAssignmentsByGroupId(
        req.user?.id,
        cursor,
        take,
        groupId,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('registered-finished')
  async getRegisteredFinishedAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('search') search?: string
  ) {
    try {
      return await this.assignmentService.getRegisteredFinishedAssignments(
        cursor,
        take,
        groupId,
        req.user.id,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('registered-ongoing-upcoming')
  async getRegisteredOngoingUpcomingAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('search') search?: string
  ) {
    try {
      return await this.assignmentService.getRegisteredOngoingUpcomingAssignments(
        groupId,
        req.user.id,
        search
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getAssignment(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    try {
      return await this.assignmentService.getAssignment(
        id,
        groupId,
        req.user?.id
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Post(':id/participation')
  async createAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    try {
      return await this.assignmentService.createAssignmentRecord(
        assignmentId,
        req.user.id,
        invitationCode,
        groupId
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  // unregister only for upcoming Assignment
  @Delete(':id/participation')
  async deleteAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    try {
      return await this.assignmentService.deleteAssignmentRecord(
        assignmentId,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (
        error instanceof ForbiddenAccessException ||
        error instanceof EntityNotExistException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }
}
