import { Module } from '@nestjs/common'
import { ContestService } from './contest.service'
import { ContestResolver } from './contest.resolver'

@Module({
  providers: [ContestService, ContestResolver]
})
export class ContestModule {}
