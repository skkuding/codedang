import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
