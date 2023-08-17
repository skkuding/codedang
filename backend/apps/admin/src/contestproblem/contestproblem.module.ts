import { Module } from '@nestjs/common'
import { ContestproblemResolver } from './contestproblem.resolver'
import { ContestproblemService } from './contestproblem.service'

@Module({
  providers: [ContestproblemResolver, ContestproblemService]
})
export class ContestproblemModule {}
