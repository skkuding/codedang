import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  controllers: [NoticeController],
  providers: [NoticeService, { provide: APP_GUARD, useClass: GroupMemberGuard }]
})
export class NoticeModule {}
