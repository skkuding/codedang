import { Module } from '@nestjs/common'
import { NotificationListener } from './notification.listener'
import { NotificationService } from './notification.service'

@Module({
  providers: [NotificationService, NotificationListener]
})
export class NotificationModule {}
