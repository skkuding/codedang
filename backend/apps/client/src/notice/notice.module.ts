import { Module } from '@nestjs/common'
import { NoticeController, GroupNoticeController } from './notice.controller'
import {
  NoticeAdminController,
  GroupNoticeAdminController
} from './notice-admin.controller'
import { NoticeService } from './notice.service'
import { GroupModule } from '~/group/group.module'
import { UserModule } from '~/user/user.module'

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
