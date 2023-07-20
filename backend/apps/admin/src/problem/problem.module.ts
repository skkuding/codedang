import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { StorageService } from '@admin/storage/storage.service'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

@Module({
  imports: [StorageModule],
  providers: [ProblemService, ProblemResolver, StorageService]
})
export class ProblemModule {}
