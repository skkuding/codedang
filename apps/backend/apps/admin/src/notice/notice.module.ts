import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupModule } from '@admin/group/group.module'
import { UserModule } from '@admin/user/user.module'
import { CourseNoticeResolver, NoticeResolver } from './notice.resolver'
import { CourseNoticeService, NoticeService } from './notice.service'

@Module({
  imports: [RolesModule, UserModule, GroupModule],
  providers: [
    NoticeService,
    NoticeResolver,
    CourseNoticeService,
    CourseNoticeResolver
  ]
})
export class NoticeModule {}
