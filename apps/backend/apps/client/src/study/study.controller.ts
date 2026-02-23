import {
  Controller,
  Get,
  Post,
  Logger,
  Body,
  Param,
  Delete,
  Req,
  Query
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfPublic,
  UseGroupLeaderGuard
} from '@libs/auth'
import { GroupIDPipe } from '@libs/pipe'
import { CreateStudyDto } from './dto/study.dto'
import { StudyService } from './study.service'

@Controller('study')
export class StudyController {
  private readonly logger = new Logger(StudyController.name)

  constructor(private readonly studyService: StudyService) {}

  @Post()
  async createStudyGroup(
    @Req() req: AuthenticatedRequest,
    @Body() createStudyDto: CreateStudyDto
  ) {
    return await this.studyService.createStudyGroup(req.user.id, createStudyDto)
  }

  @Get()
  @UserNullWhenAuthFailedIfPublic()
  async getStudyGroups(@Req() req: AuthenticatedRequest) {
    return await this.studyService.getStudyGroups(req.user?.id)
  }

  @Delete(':groupId')
  @UseGroupLeaderGuard()
  async deleteStudyGroup(@Param('groupId', GroupIDPipe) groupId: number) {
    return await this.studyService.deleteStudyGroup(groupId)
  }

  @Post(':groupId/join')
  async joinStudyGroupById(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', GroupIDPipe) groupId: number,
    @Query('invitation') invitation?: string
  ) {
    return await this.studyService.joinStudyGroupById(
      req.user.id,
      groupId,
      invitation
    )
  }
}
