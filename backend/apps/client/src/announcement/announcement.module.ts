import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  // ContestAnnouncementController,
  // GroupContestAnnouncementController,
  ContestAnnouncementController,
  ProblemAnnouncementController
} from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  controllers: [
    // ContestAnnouncementController,
    ProblemAnnouncementController,
    // GroupContestAnnouncementController,
    ContestAnnouncementController
  ],
  providers: [AnnouncementService],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
