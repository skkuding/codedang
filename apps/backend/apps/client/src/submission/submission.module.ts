import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { CONSUME_CHANNEL, PUBLISH_CHANNEL } from '@libs/constants'
import {
  LibsRabbitMQModule,
  SubmissionPublicationService,
  SubmissionSubscriptionService
} from '@libs/rabbitmq'
import { ProblemModule } from '@client/problem/problem.module'
import {
  ContestSubmissionController,
  SubmissionController,
  AssignmentSubmissionController
} from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    LibsRabbitMQModule,
    HttpModule,
    RolesModule,
    ProblemModule
  ],
  controllers: [
    SubmissionController,
    ContestSubmissionController,
    AssignmentSubmissionController
  ],
  providers: [
    SubmissionService,
    SubmissionPublicationService,
    SubmissionSubscriptionService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ]
})
export class SubmissionModule {}
