import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { StorageModule } from '@libs/storage'
import { AttachmentService } from './attachment.service'

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [AttachmentService],
  exports: [AttachmentService]
})
export class AttachmentModule {}
