import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CourseNoticeController, NoticeController } from './notice.controller'
import { CourseNoticeService, NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  controllers: [NoticeController, CourseNoticeController],
  providers: [NoticeService, CourseNoticeService]
})
export class NoticeModule {}
