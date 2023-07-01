import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  ContestAdminController,
  ContestPublicizingRequestAdminController,
  ContestPublicizingRequestController,
  GroupContestAdminController
} from './contest-admin.controller'
import { ContestController, GroupContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule],
  controllers: [
    ContestController,
    GroupContestController,
    ContestAdminController,
    GroupContestAdminController,
    ContestPublicizingRequestController,
    ContestPublicizingRequestAdminController
  ],
  providers: [ContestService],
  exports: [ContestService]
})
export class ContestModule {}
