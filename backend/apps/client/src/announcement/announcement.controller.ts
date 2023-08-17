import {
  Controller,
  Get,
  Param,
  Logger,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common'
import { AuthNotNeeded } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { ProblemAnnouncement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'

@Controller('contest/:contestId')
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

@Controller('problem/:problemId')
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
