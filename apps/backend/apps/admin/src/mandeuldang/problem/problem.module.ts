import { Module } from '@nestjs/common'
import { MandeuldangProblemResolver } from './resolvers/problem.resolver'
import { MandeuldangProblemService } from './services/problem.service'

@Module({
  providers: [MandeuldangProblemService, MandeuldangProblemResolver]
})
export class MandeuldangProblemModule {}
