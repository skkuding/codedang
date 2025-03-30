import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@admin/storage/storage.module'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  imports: [RolesModule, StorageModule],
  providers: [SubmissionResolver, SubmissionService]
})
export class SubmissionModule {}
