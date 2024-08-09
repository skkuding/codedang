import { Module } from '@nestjs/common'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  providers: [SubmissionResolver, SubmissionService]
})
export class SubmissionModule {}
