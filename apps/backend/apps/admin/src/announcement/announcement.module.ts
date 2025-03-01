import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { AnnouncementResolver } from './announcement.resolver'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  providers: [AnnouncementResolver, AnnouncementService]
})
export class AnnouncementModule {}
