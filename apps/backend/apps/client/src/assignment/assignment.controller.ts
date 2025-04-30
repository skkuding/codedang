import {
  Controller,
  Param,
  Post,
  Req,
  Get,
  Query,
  Delete,
  ParseBoolPipe,
  DefaultValuePipe
} from '@nestjs/common'
import { AuthenticatedRequest } from '@libs/auth'
import { GroupIDPipe, IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { AssignmentService } from './assignment.service'

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('')
  async getAssignments(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query(
      'isExercise',
      new ParseBoolPipe({ optional: true }),
      new DefaultValuePipe(false)
    )
    isExercise: boolean
  ) {
    return await this.assignmentService.getAssignments(groupId, isExercise)
  }

  @Get(':id')
  async getAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('id')) id: number
  ) {
    return await this.assignmentService.getAssignment(id, req.user.id)
  }

  @Post(':id/participation')
  async participateAssignment(
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

  @Post('/participation')
  async participateAllOngoingAssignments(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.assignmentService.participateAllOngoingAssignments(
      groupId,
      req.user.id
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

  @Get(':id/anonymized-scores')
  async getAnonymizedScores(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.getAnonymizedScores(
      assignmentId,
      groupId
    )
  }

  @Get(':id/me')
  async getMyAssignmentProblemRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', IDValidationPipe) assignmentId: number
  ) {
    return await this.assignmentService.getMyAssignmentProblemRecord(
      assignmentId,
      req.user.id
    )
  }

  @Get('/me/summary')
  async getMyAssignmentsSummary(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query(
      'isExercise',
      new ParseBoolPipe({ optional: true }),
      new DefaultValuePipe(false)
    )
    isExercise: boolean
  ) {
    return await this.assignmentService.getMyAssignmentsSummary(
      groupId,
      req.user.id,
      isExercise
    )
  }
}
