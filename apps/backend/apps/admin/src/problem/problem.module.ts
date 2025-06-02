import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { TestcaseModule } from '@admin/testcase/testcase.module'
import { TestcaseService } from '@admin/testcase/testcase.service'
import {
  FileResolver,
  ProblemTagResolver,
  TagResolver,
  TestcaseResolver
} from './resolvers'
import { ProblemResolver } from './resolvers/problem.resolver'
import { IntScoreScalar } from './scalar/int-score.scalar'
import {
  FileService,
  ProblemService,
  TagService,
  TestcaseService as ProblemTestcaseService
} from './services'

@Module({
  imports: [StorageModule, ConfigModule, RolesModule, TestcaseModule],
  providers: [
    ProblemResolver,
    ProblemTagResolver,
    TagResolver,
    TestcaseService,
    ProblemTestcaseService,
    TestcaseResolver,
    FileResolver,
    IntScoreScalar,
    ProblemService,
    TestcaseService,
    FileService,
    TagService
  ],
  exports: [IntScoreScalar, ProblemService]
})
export class ProblemModule {}
