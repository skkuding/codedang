import { Module } from '@nestjs/common'
import { RedisPubSubService } from './redis-pubsub.service'

@Module({
  providers: [RedisPubSubService],
  exports: [RedisPubSubService]
})
export class RedisPubSubModule {}
