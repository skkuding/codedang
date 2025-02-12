import { Module } from '@nestjs/common'
import { SubmissionPublicationService } from './submission-pub.service'
import { SubmissionSubscriptionService } from './submission-sub.service'

@Module({
  providers: [SubmissionSubscriptionService, SubmissionPublicationService],
  exports: [SubmissionSubscriptionService, SubmissionPublicationService]
})
export class RabbitMQModule {}
