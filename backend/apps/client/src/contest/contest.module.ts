import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService]
})
export class ContestModule {}
