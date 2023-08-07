import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { NoticeController, GroupNoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  controllers: [NoticeController, GroupNoticeController],
  providers: [NoticeService]
})
export class NoticeModule {}
