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
import { AuthNotNeeded, GroupMemberGuard, RolesGuard } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import type { ProblemAnnouncement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'

@Controller('announcement/contest/:contestId')
@AuthNotNeeded()
export class ContestAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getContestAnnouncementsByContest(
    @Param('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.announcementService.getContestAnnouncements(contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId?')
  async getProblemAnnouncementByContest(
    @Param('contestId', ParseIntPipe) contestId = 0,
    @Param('problemId', ParseIntPipe) problemId = 0
  ): Promise<Partial<ProblemAnnouncement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        contestId,
        problemId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('announcement/problem/:problemId')
@AuthNotNeeded()
export class ProblemAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getProblemAnnouncementsByProblem(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<Partial<ProblemAnnouncement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(problemId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('announcement/group/:groupId/contest/:contestId')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupContestAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getContestAnnouncementsByContest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    try {
      return await this.announcementService.getContestAnnouncements(
        contestId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get('problem/:problemId?')
  async getProblemAnnouncementByContest(
    @Param('contestId', ParseIntPipe) contestId = 0,
    @Param('problemId', ParseIntPipe) problemId = 0,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<ProblemAnnouncement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        contestId,
        problemId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('announcement/group/:groupId/problem/:problemId')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupProblemAnnouncementController {
  private readonly logger = new Logger(ContestAnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getProblemAnnouncementsByProblem(
    @Param('problemId', ParseIntPipe) problemId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<Partial<ProblemAnnouncement>[]> {
    try {
      return await this.announcementService.getProblemAnnouncements(
        problemId,
        groupId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
