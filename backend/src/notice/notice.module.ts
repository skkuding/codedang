import { Module } from '@nestjs/common'
import {
  PublicNoticeController,
  GroupNoticeController
} from './notice.controller'
import { NoticeAdminController } from './notice-admin.controller'
import { NoticeService } from './notice.service'

@Module({
  controllers: [
    PublicNoticeController,
    GroupNoticeController,
    NoticeAdminController
  ],
  providers: [NoticeService]
})
export class NoticeModule {}
