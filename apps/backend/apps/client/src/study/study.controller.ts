import {
  Controller,
  Get,
  Post,
  Logger,
  Body,
  Patch,
  Param,
  Delete,
  Req
} from '@nestjs/common'
import { UserNullWhenAuthFailedIfPublic } from '@libs/auth'
import { AuthenticatedRequest, GroupMemberGuard } from '@libs/auth'
import { GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
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
  getStudyGroups(@Req() req: AuthenticatedRequest) {
    return this.studyService.getStudyGroups(req.user?.id)
  }
}
