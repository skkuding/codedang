import { Module } from '@nestjs/common'
import { StorageModule } from '@libs/storage'
import { MandeuldangProblemResolver } from './resolvers/problem.resolver'
import { MandeuldangProblemService } from './services/problem.service'
import { PublishCheckService } from './services/publish-check.service'

@Module({
  imports: [StorageModule],
  providers: [
    MandeuldangProblemService,
    PublishCheckService,
    MandeuldangProblemResolver
  ]
})
export class MandeuldangProblemModule {}
