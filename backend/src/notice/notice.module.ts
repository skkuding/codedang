import { Module } from '@nestjs/common'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  controllers: [NoticeController],
  providers: [NoticeService]
})
export class NoticeModule {}
