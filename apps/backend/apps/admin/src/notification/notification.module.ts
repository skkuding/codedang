import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { AssignmentModule } from '@admin/assignment/assignment.module'
import { ContestNotificationProcessor } from './contest-notification.processor'
import { ContestNotificationScheduler } from './contest-notification.scheduler'
import { NotificationListener } from './notification.listener'
import { NotificationService } from './notification.service'

@Module({
  imports: [
    AssignmentModule,
    PrismaModule,
    BullModule.registerQueue({ name: 'notification' })
  ],
  providers: [
    NotificationService,
    NotificationListener,
    ContestNotificationProcessor,
    ContestNotificationScheduler
  ],
  exports: [ContestNotificationScheduler]
})
export class NotificationModule {}
