import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  LibsRabbitMQModule,
  SubmissionPublicationService
} from '@libs/rabbitmq'
import { SubmissionController } from './submission.controller'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  imports: [RolesModule, LibsRabbitMQModule],
  controllers: [SubmissionController],
  providers: [
    SubmissionResolver,
    SubmissionService,
    SubmissionPublicationService
  ]
})
export class SubmissionModule {}
