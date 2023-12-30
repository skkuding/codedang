import {
  Controller,
  Get,
  Param,
  Logger,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  UseGuards
} from '@nestjs/common'
import type { Announcement } from '@prisma/client'
import { AuthNotNeeded, GroupMemberGuard, RolesGuard } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { AnnouncementService } from './announcement.service'

@Controller('announcement/problem/:problemId')
@AuthNotNeeded()
export class ProblemAnnouncementController {
  private readonly logger = new Logger(ProblemAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getPublicProblemAnnouncements(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Announcement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        problemId,
        1
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('group/:groupId')
  @UseGuards(RolesGuard, GroupMemberGuard)
  async getGroupProblemAnnouncements(
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Announcement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        problemId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('announcement/contest/:contestId')
@AuthNotNeeded()
export class ContestAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getPublicProblemAnnouncements(
    @Param('contestId', ParseIntPipe) contestId: number
  ): Promise<Partial<Announcement>[]> {
    try {
      return await this.announcementService.getContestAnnouncements(
        contestId,
        1
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get('group/:groupId')
  @UseGuards(RolesGuard, GroupMemberGuard)
  async getGroupProblemAnnouncements(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<Announcement>[]> {
    try {
      return await this.announcementService.getContestAnnouncements(
        contestId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
