import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { CourseNoticeController, NoticeController } from './notice.controller'
import { CourseNoticeService, NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  controllers: [NoticeController, CourseNoticeController],
  providers: [
    NoticeService,
    CourseNoticeService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ]
})
export class NoticeModule {}
