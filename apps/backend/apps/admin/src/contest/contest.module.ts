import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { UserModule } from '@admin/user/user.module'
import { ContestQnAResolver, ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule, UserModule],
  providers: [ContestService, ContestResolver, ContestQnAResolver]
})
export class ContestModule {}
