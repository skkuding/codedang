import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RolesModule } from '@libs/auth'
import { NotificationModule } from '@admin/notification/notification.module'
import { ProblemModule } from '@admin/problem/problem.module'
import { UserModule } from '@admin/user/user.module'
import { ContestProblemResolver } from './contest-problem.resolver'
import { ContestProblemService } from './contest-problem.service'
import { ContestQnAResolver, ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [
    RolesModule,
    ProblemModule,
    UserModule,
    BullModule.registerQueue({ name: 'notification' }),
    NotificationModule,
    EventEmitter2
  ],
  providers: [
    ContestService,
    ContestProblemService,
    ContestResolver,
    ContestProblemResolver,
    ContestQnAResolver
  ]
})
export class ContestModule {}
