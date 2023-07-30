import { Module } from '@nestjs/common'
import { S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

@Module({
  providers: [S3Provider, StorageService],
  exports: [StorageService]
})
export class StorageModule {}
