import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { RabbitMQLibModule } from '@libs/rabbitmq'
import { ProblemModule } from '@client/problem/problem.module'
import { SubmissionPublicationService } from './submission-pub.service'
import { SubmissionSubscriptionService } from './submission-sub.service'
import {
  ContestSubmissionController,
  SubmissionController,
  AssignmentSubmissionController
} from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [HttpModule, RabbitMQLibModule, RolesModule, ProblemModule],
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
