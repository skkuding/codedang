import { Module } from '@nestjs/common'
import { ContestAdminController } from './contest-admin.controller'
import { ContestController, ContestGroupController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  controllers: [
    ContestController,
    ContestAdminController,
    ContestGroupController
  ],
  providers: [ContestService]
})
export class ContestModule {}
