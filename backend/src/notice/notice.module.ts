import { Module } from '@nestjs/common'
import { GroupModule } from 'src/group/group.module'
import {
  PublicNoticeController,
  GroupNoticeController
} from './notice.controller'
import { NoticeAdminController } from './notice-admin.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [GroupModule],
  controllers: [
    PublicNoticeController,
    GroupNoticeController,
    NoticeAdminController
  ],
  providers: [NoticeService]
})
export class NoticeModule {}
