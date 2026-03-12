import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common'
import { AuthenticatedRequest, GroupMemberGuard } from '@libs/auth'
import { GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { CreateStudyDto, UpdateStudyDto, UpsertDraftDto } from './dto/study.dto'
import { StudyService } from './study.service'

@Controller('study')
export class StudyController {
  private readonly logger = new Logger(StudyController.name)

  constructor(private readonly studyService: StudyService) {}

  @Post()
  async createStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStudyDto
  ) {
    return this.studyService.createStudyGroup(req.user.id, dto)
  }

  @Get('joined')
  async getJoinedStudyGroups(@Req() req: AuthenticatedRequest) {
    return this.studyService.getJoinedStudyGroups(req.user.id)
  }

  @Get(':groupId')
  async getStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return this.studyService.getStudyGroup(groupId, req.user.id)
  }

  @Patch(':groupId')
  @UseGuards(GroupMemberGuard)
  async updateStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Body() dto: UpdateStudyDto
  ) {
    return this.studyService.updateStudyGroup(groupId, req.user.id, dto)
  }

  @Delete(':groupId')
  @UseGuards(GroupMemberGuard)
  async deleteStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return this.studyService.deleteStudyGroup(groupId, req.user.id)
  }

  @Post(':groupId/join')
  async joinStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return this.studyService.joinStudyGroup(groupId, req.user.id)
  }

  @Get(':groupId/join')
  @UseGuards(GroupMemberGuard)
  async getJoinRequests(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return this.studyService.getJoinRequests(groupId, req.user.id)
  }

  @Post(':groupId/join/:userId/accept')
  @UseGuards(GroupMemberGuard)
  async acceptJoinRequest(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Param('userId', new RequiredIntPipe('userId')) targetUserId: number
  ) {
    return this.studyService.handleJoinRequest(
      groupId,
      req.user.id,
      targetUserId,
      true
    )
  }

  @Post(':groupId/join/:userId/reject')
  @UseGuards(GroupMemberGuard)
  async rejectJoinRequest(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Param('userId', new RequiredIntPipe('userId')) targetUserId: number
  ) {
    return this.studyService.handleJoinRequest(
      groupId,
      req.user.id,
      targetUserId,
      false
    )
  }

  @Delete(':groupId/leave')
  @UseGuards(GroupMemberGuard)
  async leaveStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number
  ) {
    return this.studyService.leaveStudyGroup(groupId, req.user.id)
  }

  @Put('draft/:problemId')
  async upsertDraft(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Body() dto: UpsertDraftDto
  ) {
    return this.studyService.upsertDraft(req.user.id, problemId, dto.code)
  }

  @Get('draft/:problemId')
  async getDraft(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return this.studyService.getDraft(req.user.id, problemId)
  }

  @Delete('draft/:problemId')
  async deleteDraft(
    @Req() req: AuthenticatedRequest,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    return this.studyService.deleteDraft(req.user.id, problemId)
  }
}
