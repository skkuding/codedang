import { Module } from '@nestjs/common'
import { ContestProblemResolver } from './contest-problem.resolver'
import { ContestProblemService } from './contest-problem.service'

@Module({
  providers: [ContestProblemResolver, ContestProblemService]
})
export class ContestProblemModule {}
