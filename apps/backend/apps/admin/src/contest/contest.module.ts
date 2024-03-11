import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule],
  providers: [ContestService, ContestResolver]
})
export class ContestModule {}
