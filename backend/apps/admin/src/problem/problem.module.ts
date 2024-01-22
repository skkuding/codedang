import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

@Module({
  imports: [StorageModule],
  providers: [ProblemResolver, ProblemService]
})
export class ProblemModule {}
