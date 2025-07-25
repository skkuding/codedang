import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { AssignmentModule } from '@admin/assignment/assignment.module'
import { NotificationListener } from './notification.listener'
import { NotificationService } from './notification.service'

@Module({
  imports: [AssignmentModule, PrismaModule],
  providers: [NotificationService, NotificationListener]
})
export class NotificationModule {}
