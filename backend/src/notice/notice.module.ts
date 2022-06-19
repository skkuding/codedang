import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [PrismaModule],
  controllers: [NoticeController],
  providers: [NoticeService]
})
export class NoticeModule {}
