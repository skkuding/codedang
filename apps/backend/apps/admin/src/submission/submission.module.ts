import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@admin/storage/storage.module'
import { TestcaseModule } from '@admin/testcase/testcase.module'
import { TestcaseService } from '@admin/testcase/testcase.service'
import { SubmissionController } from './submission.controller'
import { SubmissionResolver } from './submission.resolver'
import { SubmissionService } from './submission.service'

@Module({
  imports: [RolesModule, TestcaseModule, StorageModule],
  controllers: [SubmissionController],
  providers: [SubmissionResolver, SubmissionService, TestcaseService]
})
export class SubmissionModule {}
