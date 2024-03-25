import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { S3MediaProvider, S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

@Module({
  imports: [ConfigModule],
  providers: [S3Provider, S3MediaProvider, StorageService],
  exports: [StorageService]
})
export class StorageModule {}
