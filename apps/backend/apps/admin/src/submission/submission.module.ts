import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { RabbitMQLibModule } from '@libs/rabbitmq'
import { SubmissionController } from './submission.controller'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  imports: [RolesModule, RabbitMQLibModule],
  controllers: [SubmissionController],
  providers: [SubmissionResolver, SubmissionService]
})
export class SubmissionModule {}
