import { Module } from '@nestjs/common'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService]
})
export class AnnouncementModule {}
