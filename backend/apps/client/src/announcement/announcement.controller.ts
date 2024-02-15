import {
  Controller,
  Get,
  Logger,
  InternalServerErrorException,
  Query
} from '@nestjs/common'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { GroupIDPipe, IDValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfOpenSpace()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getAnnouncements(
    @Query('problemId', IDValidationPipe) problemId: number | null,
    @Query('contestId', RequiredIntPipe) contestId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      if (problemId) {
        return await this.announcementService.getProblemAnnouncements(
          problemId,
          contestId,
          groupId
        )
      } else {
        return await this.announcementService.getContestAnnouncements(
          contestId,
          groupId
        )
      }
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
