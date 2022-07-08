import { Module } from '@nestjs/common'
import {
  PublicNoticeController,
  GroupNoticeController,
  NoticeAdminController
} from './notice.controller'
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
