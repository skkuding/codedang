import { Module } from '@nestjs/common'
import { GroupModule } from 'src/group/group.module'
import { UserModule } from 'src/user/user.module'
import {
  ContestAdminController,
  ContestPublicizingRequestAdminController,
  ContestPublicizingRequestController,
  GroupContestAdminController
} from './contest-admin.controller'
import {
  PublicContestController,
  GroupContestController
} from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [GroupModule, UserModule],
  controllers: [
    PublicContestController,
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
