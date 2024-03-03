import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemTagResolver, TagResolver } from './problem-tag.resolver'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

@Module({
  imports: [StorageModule],
  providers: [ProblemResolver, ProblemTagResolver, TagResolver, ProblemService]
})
export class ProblemModule {}
