import { Module } from '@nestjs/common'
import { ContestResolver } from './contest.resolver'
import { ContestService } from './contest.service'

@Module({
  providers: [ContestService, ContestResolver]
})
export class ContestModule {}
