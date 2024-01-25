import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupModule } from '@admin/group/group.module'
import { UserModule } from '@admin/user/user.module'
import { NoticeResolver } from './notice.resolver'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule, UserModule, GroupModule],
  providers: [NoticeService, NoticeResolver]
})
export class NoticeModule {}
