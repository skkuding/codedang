import { Controller, Get, Logger, Query } from '@nestjs/common'
import { AuthNotNeededIfPublic } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfPublic()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)
  constructor(private readonly announcementService: AnnouncementService) {}

  /**
   * 대회의 공지 목록을 최신순으로 조회합니다.
   */
  @Get()
  async getAnnouncements(
    @Query('contestId', IDValidationPipe) contestId: number
  ) {
    return this.announcementService.getContestAnnouncements(contestId)
  }
}
