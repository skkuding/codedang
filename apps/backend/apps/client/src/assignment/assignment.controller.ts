import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  Delete,
  BadRequestException
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
  async getAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.assignmentService.getAssignment(id, req.user.id)
  }

  @Post(':id/participation')
  async createAssignmentRecord(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.createAssignmentRecord(
      assignmentId,
      req.user.id,
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

  @Get(':id/score')
  async getAnonymizedScores(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number,
    @Query('anonymized') anonymized: boolean
  ) {
    if (!anonymized) {
      throw new BadRequestException(
        'This API is only available with anonymized=true'
      )
    }

    return await this.assignmentService.getAnonymizedScores(
      assignmentId,
      groupId
    )
  }

  @Get(':id/score/me')
  async getMyAssignmentProblemRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) assignmentId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.getMyAssignmentProblemRecord(
      assignmentId,
      req.user.id,
      groupId
    )
  }
}
