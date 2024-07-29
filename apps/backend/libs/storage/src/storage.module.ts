import { Global, Module } from '@nestjs/common'
import { S3MediaProvider, S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

@Global()
@Module({
  providers: [S3Provider, S3MediaProvider, StorageService],
  exports: [StorageService]
})
export class StorageModule {}
