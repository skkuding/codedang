import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { ContestLoader } from './contest.loader'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule],
  providers: [ContestService, ContestResolver, ContestLoader],
  exports: [ContestService, ContestLoader]
})
export class ContestModule {}
