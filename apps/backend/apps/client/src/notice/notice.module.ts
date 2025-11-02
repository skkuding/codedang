import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [RolesModule],
  controllers: [NoticeController],
  providers: [NoticeService]
})
export class NoticeModule {}
