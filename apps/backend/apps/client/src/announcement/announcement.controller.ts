import { Controller, Get, Logger, Query } from '@nestjs/common'
import { AuthNotNeededIfPublic } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfPublic()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getAnnouncements(
    @Query('contestId', IDValidationPipe) contestId: number
  ) {
    try {
      return await this.announcementService.getContestAnnouncements(contestId)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
