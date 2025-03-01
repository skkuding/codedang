import {
  Controller,
  Get,
  Logger,
  InternalServerErrorException,
  Query
} from '@nestjs/common'
import { AuthNotNeededIfPublic } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
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
      if (!contestId) {
        throw new UnprocessableDataException('ContestId must be provided.')
      } else {
        return await this.announcementService.getContestAnnouncements(contestId)
      }
    } catch (error) {
      if (
        error instanceof EntityNotExistException ||
        error instanceof UnprocessableDataException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
