import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Query,
  BadRequestException
} from '@nestjs/common'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfOpenSpace()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getAnnouncements(
    @Query('problemId', IdValidationPipe) problemId: number | undefined,
    @Query('contestId', IdValidationPipe) contestId: number | undefined,
    @Query('groupId', IdValidationPipe) groupId: number | undefined
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
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
    throw new BadRequestException(
      'Both problemId and contestId are not entered'
    )
  }
}
