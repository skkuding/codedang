import {
  Controller,
  Get,
  Post,
  Logger,
  Body,
  Param,
  Delete,
  Req,
  Query,
  Patch,
  DefaultValuePipe
} from '@nestjs/common'
import {
  AuthenticatedRequest,
  UserNullWhenAuthFailedIfPublic,
  UseGroupLeaderGuard
} from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { CreateStudyDto, UpdateStudyDto } from './dto/study.dto'
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
  async getStudyGroups(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    return await this.studyService.getStudyGroups({
      userId: req.user?.id,
      cursor,
      take
    })
  }

  @Get(':groupId')
  async getStudyGroup(
    @Param('groupId', GroupIDPipe) groupId: number,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.studyService.getStudyGroup(groupId, req.user.id)
  }

  @Patch(':groupId')
  @UseGroupLeaderGuard()
  async updateStudyGroup(
    @Param('groupId', GroupIDPipe) groupId: number,
    @Body() updateStudyDto: UpdateStudyDto
  ) {
    return await this.studyService.updateStudyGroup(groupId, updateStudyDto)
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
