import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Query,
  ConflictException
} from '@nestjs/common'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfOpenSpace()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getAnnouncements(
    @Query('problemId', IdValidationPipe) problemId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('groupId', IdValidationPipe) groupId: number | null
  ) {
    try {
      if (problemId) {
        return await this.announcementService.getProblemAnnouncements(
          problemId,
          groupId ?? OPEN_SPACE_ID
        )
      } else if (contestId) {
        return await this.announcementService.getContestAnnouncements(
          contestId,
          groupId ?? OPEN_SPACE_ID
        )
      }
      throw new ConflictException(
        'Both problemId and contestId are not entered'
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictException) {
        throw new ConflictFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
