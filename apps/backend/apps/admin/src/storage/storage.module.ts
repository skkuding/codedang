import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

@Module({
  imports: [ConfigModule],
  providers: [S3Provider, StorageService],
  exports: [StorageService]
})
export class StorageModule {}
