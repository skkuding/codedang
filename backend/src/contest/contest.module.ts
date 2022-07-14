import { Module } from '@nestjs/common'
import { ContestAdminController } from './contest-admin.controller'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  controllers: [ContestController, ContestAdminController],
  providers: [ContestService]
})
export class ContestModule {}
