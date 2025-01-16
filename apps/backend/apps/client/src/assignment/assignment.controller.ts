import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  DefaultValuePipe,
  Delete
} from '@nestjs/common'
import {
  AuthNotNeededIfOpenSpace,
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfOpenSpace
} from '@libs/auth'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { AssignmentService } from './assignment.service'

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('ongoing-upcoming')
  @AuthNotNeededIfOpenSpace()
  async getOngoingUpcomingAssignments(
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.getAssignmentsByGroupId(groupId)
  }

  @Get('ongoing-upcoming-with-registered')
  async getOngoingUpcomingAssignmentsWithRegistered(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.getAssignmentsByGroupId(
      groupId,
      req.user.id
    )
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
    return await this.assignmentService.getFinishedAssignmentsByGroupId(
      req.user?.id,
      cursor,
      take,
      groupId,
      search
    )
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
    return await this.assignmentService.getRegisteredFinishedAssignments(
      cursor,
      take,
      groupId,
      req.user.id,
      search
    )
  }

  @Get('registered-ongoing-upcoming')
  async getRegisteredOngoingUpcomingAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('search') search?: string
  ) {
    return await this.assignmentService.getRegisteredOngoingUpcomingAssignments(
      groupId,
      req.user.id,
      search
    )
  }

  @Get(':id')
  @UserNullWhenAuthFailedIfOpenSpace()
  async getAssignment(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.assignmentService.getAssignment(id, groupId, req.user?.id)
  }

  @Post(':id/participation')
  async createAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number,
    @Query('invitationCode') invitationCode?: string
  ) {
    return await this.assignmentService.createAssignmentRecord(
      assignmentId,
      req.user.id,
      invitationCode,
      groupId
    )
  }

  // unregister only for upcoming Assignment
  @Delete(':id/participation')
  async deleteAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.deleteAssignmentRecord(
      assignmentId,
      req.user.id,
      groupId
    )
  }
}
