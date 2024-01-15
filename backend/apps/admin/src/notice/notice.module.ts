import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { NoticeResolver } from './notice.resolver'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  providers: [NoticeService, NoticeResolver]
})
export class NoticeModule {}
