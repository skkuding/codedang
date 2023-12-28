import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  ContestAnnouncementController,
  ProblemAnnouncementController
} from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  controllers: [ProblemAnnouncementController, ContestAnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
