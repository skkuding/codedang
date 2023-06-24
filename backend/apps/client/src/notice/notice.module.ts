import { Module } from '@nestjs/common'
import { GroupModule } from '@client/group/group.module'
import { UserModule } from '@client/user/user.module'
import {
  NoticeAdminController,
  GroupNoticeAdminController
} from './notice-admin.controller'
import { NoticeController, GroupNoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [UserModule, GroupModule],
  controllers: [
    NoticeController,
    GroupNoticeController,
    NoticeAdminController,
    GroupNoticeAdminController
  ],
  providers: [NoticeService]
})
export class NoticeModule {}
