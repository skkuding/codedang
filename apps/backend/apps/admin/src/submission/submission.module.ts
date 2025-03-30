import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  imports: [RolesModule],
  providers: [SubmissionResolver, SubmissionService]
})
export class SubmissionModule {}
