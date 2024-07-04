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

@Module({
  imports: [StorageModule, ConfigModule],
  providers: [
    ProblemResolver,
    ProblemTagResolver,
    TagResolver,
    ProblemService,
    ContestProblemResolver,
    WorkbookProblemResolver
  ]
})
export class ProblemModule {}
