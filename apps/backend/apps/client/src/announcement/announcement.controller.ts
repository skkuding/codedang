import {
  Controller,
  Get,
  Logger,
  InternalServerErrorException,
  Query
} from '@nestjs/common'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { GroupIDPipe, IDValidationPipe } from '@libs/pipe'
import { AnnouncementService } from './announcement.service'

@Controller('announcement')
@AuthNotNeededIfOpenSpace()
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name)

  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  async getAnnouncements(
    @Query('problemId', IDValidationPipe) problemId: number | null,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('assignmentId', IDValidationPipe) assignmentId: number | null,
    @Query('groupId', GroupIDPipe)
    groupId: number
  ) {
    try {
      if (problemId) {
        return await this.announcementService.getProblemAnnouncements(
          contestId,
          assignmentId,
          problemId,
          groupId
        )
      } else {
        if (contestId) {
          return await this.announcementService.getContestAnnouncements(
            contestId,
            groupId
          )
        } else if (assignmentId) {
          return await this.announcementService.getAssignmentAnnouncements(
            assignmentId,
            groupId
          )
        } else {
          return []
        }
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
