import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemTagResolver, TagResolver } from './problem-tag.resolver'
import {
  ContestProblemResolver,
  ProblemResolver,
  WorkbookProblemResolver
} from './problem.resolver'
import { ProblemService } from './problem.service'

@Module({
  imports: [StorageModule],
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
