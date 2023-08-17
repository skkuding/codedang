import { Module } from '@nestjs/common'
import {
  ContestAnnouncementController,
  ProblemAnnouncementController
} from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  controllers: [ContestAnnouncementController, ProblemAnnouncementController],
  providers: [AnnouncementService]
})
export class AnnouncementModule {}
