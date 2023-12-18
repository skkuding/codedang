import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  // ContestAnnouncementController,
  // GroupContestAnnouncementController,
  GroupProblemAnnouncementController,
  ProblemAnnouncementController
} from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  controllers: [
    // ContestAnnouncementController,
    ProblemAnnouncementController,
    // GroupContestAnnouncementController,
    GroupProblemAnnouncementController
  ],
  providers: [AnnouncementService]
})
export class AnnouncementModule {}
