import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AMQPModule } from '@libs/amqp'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { ProblemModule } from '@client/problem/problem.module'
import { CodePolicyService } from '@client/submission/policy'
import { SubmissionPublicationService } from './submission-pub.service'
import { SubmissionSubscriptionService } from './submission-sub.service'
import {
  AssignmentSubmissionController,
  ContestSubmissionController,
  SubmissionController
} from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [HttpModule, AMQPModule, RolesModule, ProblemModule],
  controllers: [
    SubmissionController,
    ContestSubmissionController,
    AssignmentSubmissionController
  ],
  providers: [
    SubmissionService,
    SubmissionPublicationService,
    SubmissionSubscriptionService,
    CodePolicyService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ]
})
export class SubmissionModule {}
