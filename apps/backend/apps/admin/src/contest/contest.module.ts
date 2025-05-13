import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { UserModule } from '@admin/user/user.module'
import { ContestLoader } from './contest.loader'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule, UserModule],
  providers: [ContestService, ContestResolver, ContestLoader],
})
export class ContestModule {}
