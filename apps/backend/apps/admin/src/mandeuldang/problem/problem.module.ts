import { Module } from '@nestjs/common'
import { MandeuldangProblemResolver } from './resolvers/problem.resolver'
import { MandeuldangProblemService } from './services/problem.service'
import { PublishCheckService } from './services/publish-check.service'

@Module({
  providers: [
    MandeuldangProblemService,
    PublishCheckService,
    MandeuldangProblemResolver
  ]
})
export class MandeuldangProblemModule {}
