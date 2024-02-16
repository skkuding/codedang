import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'
import { ProblemTagResolver, TagResolver } from './problemTag.resolver'

@Module({
  imports: [StorageModule],
  providers: [ProblemResolver, ProblemTagResolver, TagResolver, ProblemService]
})
export class ProblemModule {}
