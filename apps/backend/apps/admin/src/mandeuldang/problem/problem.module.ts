import { Module } from '@nestjs/common'
import { StorageModule } from '@libs/storage'
import { MandeuldangProblemResolver } from './resolvers/problem.resolver'
import { MandeuldangProblemService } from './services/problem.service'

@Module({
  imports: [StorageModule],
  providers: [MandeuldangProblemService, MandeuldangProblemResolver]
})
export class MandeuldangProblemModule {}
