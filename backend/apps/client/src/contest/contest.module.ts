import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestController, GroupContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule],
  controllers: [ContestController, GroupContestController],
  providers: [ContestService],
  exports: [ContestService]
})
export class ContestModule {}
