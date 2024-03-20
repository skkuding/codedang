import { Module } from '@nestjs/common'
import { AnnouncementResolver } from './announcement.resolver'
import { AnnouncementService } from './announcement.service'

@Module({
  providers: [AnnouncementResolver, AnnouncementService]
})
export class AnnouncementModule {}
