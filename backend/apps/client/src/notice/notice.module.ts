import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupModule } from '@client/group/group.module'
import {
  NoticeAdminController,
  GroupNoticeAdminController
} from './notice-admin.controller'
import { NoticeController, GroupNoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule, GroupModule],
  controllers: [
    NoticeController,
    GroupNoticeController,
    NoticeAdminController,
    GroupNoticeAdminController
  ],
  providers: [NoticeService]
})
export class NoticeModule {}
