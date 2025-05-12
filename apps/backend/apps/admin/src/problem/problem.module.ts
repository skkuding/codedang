import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { TestcaseModule } from '@admin/testcase/testcase.module'
import { TestcaseService } from '@admin/testcase/testcase.service'
import { ProblemTagResolver, TagResolver } from './problem-tag.resolver'
import {
  AssignmentProblemResolver,
  ContestProblemResolver,
  ProblemResolver,
  WorkbookProblemResolver
} from './problem.resolver'
import { ProblemService } from './problem.service'
import { IntScoreScalar } from './scalar/int-score.scalar'

@Module({
  imports: [StorageModule, ConfigModule, RolesModule, TestcaseModule],
  providers: [
    ProblemResolver,
    ContestProblemResolver,
    WorkbookProblemResolver,
    AssignmentProblemResolver,
    ProblemService,
    IntScoreScalar,
    ProblemTagResolver,
    TagResolver,
    TestcaseService
  ],
  exports: [IntScoreScalar]
})
export class ProblemModule {}
