import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  Delete
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfOpenSpace
} from '@libs/auth'
import { GroupIDPipe, IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { AssignmentService } from './assignment.service'

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('')
  async getAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.getAssignments(groupId, req.user.id)
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

  @Get(':id/grade')
  async getAssignmentGrade(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.getAssignmentGrade(
      assignmentId,
      req.user.id,
      groupId
    )
  }

  @Get('gradeSummary')
  async getAssignmentGradeSummary(@User('id') userId: number) {
    return await this.assignmentService.getAssignmentGradeSummary(userId)
  }
}
