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
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { AnnouncementService } from './announcement.service'

@Controller('announcement/problem/:problemId')
export class ProblemAnnouncementController {
  private readonly logger = new Logger(ProblemAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  @AuthNotNeeded()
  async getProblemAnnouncements(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<Announcement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        problemId,
        OPEN_SPACE_ID
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
  @UseGuards(GroupMemberGuard)
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
export class ContestAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  @AuthNotNeeded()
  async getContestAnnouncements(
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
  @UseGuards(GroupMemberGuard)
  async getGroupContestAnnouncements(
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
