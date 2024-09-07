import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule],
  providers: [ContestService, ContestResolver]
})
export class ContestModule {}
