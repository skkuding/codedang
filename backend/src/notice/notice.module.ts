import { Module } from '@nestjs/common'
import {
  PublicNoticeController,
  GroupNoticeController,
  AdminNoticeController
} from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  controllers: [
    PublicNoticeController,
    GroupNoticeController,
    AdminNoticeController
  ],
  providers: [NoticeService]
})
export class NoticeModule {}
