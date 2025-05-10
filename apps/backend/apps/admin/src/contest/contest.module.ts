import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { UserModule } from '@admin/user/user.module'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule, UserModule],
  providers: [ContestService, ContestResolver]
})
export class ContestModule {}
