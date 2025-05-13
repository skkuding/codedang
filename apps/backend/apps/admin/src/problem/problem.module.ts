import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RolesModule } from '@libs/auth'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemTagResolver, TagResolver } from './problem-tag.resolver'
import { ProblemLoader } from './problem.loader'
import {
  AssignmentProblemResolver,
  ContestProblemResolver,
  ProblemResolver,
  WorkbookProblemResolver
} from './problem.resolver'
import { ProblemService } from './problem.service'
import { IntScoreScalar } from './scalar/int-score.scalar'

@Module({
  imports: [StorageModule, ConfigModule, RolesModule],
  providers: [
    ProblemResolver,
    ContestProblemResolver,
    WorkbookProblemResolver,
    AssignmentProblemResolver,
    ProblemService,
    ProblemLoader,
    IntScoreScalar,
    ProblemTagResolver,
    TagResolver
  ],
  exports: [IntScoreScalar]
})
export class ProblemModule {}
