import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [RolesModule],
  controllers: [AnnouncementController],
  providers: [
    AnnouncementService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
