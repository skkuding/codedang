import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { AssignmentModule } from '@admin/assignment/assignment.module'
import { NotificationListener } from './notification.listener'
import { NotificationProcessor } from './notification.processor'
import { NotificationScheduler } from './notification.scheduler'
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
    NotificationProcessor,
    NotificationScheduler
  ],
  exports: []
})
export class NotificationModule {}
