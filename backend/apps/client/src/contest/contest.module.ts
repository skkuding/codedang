import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupModule } from '@client/group/group.module'
import {
  ContestAdminController,
  ContestPublicizingRequestAdminController,
  ContestPublicizingRequestController,
  GroupContestAdminController
} from './contest-admin.controller'
import { ContestController, GroupContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule, GroupModule],
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
