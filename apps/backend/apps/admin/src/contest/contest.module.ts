import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { UserModule } from '@admin/user/user.module'
import { ContestProblemResolver } from './contest-problem.resolver'
import { ContestProblemService } from './contest-problem.service'
import { ContestResolver, ContestQnAResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, ProblemModule, UserModule],
  providers: [
    ContestService,
    ContestProblemService,
    ContestResolver,
    ContestProblemResolver,
    ContestQnAResolver
  ]
})
export class ContestModule {}
