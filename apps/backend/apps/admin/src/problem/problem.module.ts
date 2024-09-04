import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemTagResolver, TagResolver } from './problem-tag.resolver'
import {
  ContestProblemResolver,
  ProblemResolver,
  WorkbookProblemResolver
} from './problem.resolver'
import { ProblemService } from './problem.service'
import { IntScoreScalar } from './scalar/int-score.scalar'

@Module({
  imports: [StorageModule, ConfigModule],
  providers: [
    ProblemResolver,
    ProblemTagResolver,
    TagResolver,
    ProblemService,
    ContestProblemResolver,
    WorkbookProblemResolver,
    IntScoreScalar
  ],
  exports: [IntScoreScalar]
})
export class ProblemModule {}
