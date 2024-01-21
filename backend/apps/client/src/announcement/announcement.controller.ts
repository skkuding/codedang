import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Query,
  BadRequestException
} from '@nestjs/common'
import { GroupIDPipe } from 'libs/pipe/src/group-id.pipe'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
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
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      if (problemId) {
        return await this.announcementService.getProblemAnnouncements(
          problemId,
          groupId
        )
      } else if (contestId) {
        return await this.announcementService.getContestAnnouncements(
          contestId,
          groupId
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
