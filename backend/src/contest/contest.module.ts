import { Module } from '@nestjs/common'
import { GroupModule } from 'src/group/group.module'
import { GroupService } from 'src/group/group.service'
import {
  ContestAdminController,
  GroupContestAdminController
} from './contest-admin.controller'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [GroupModule],
  controllers: [
    ContestController,
    ContestAdminController,
    GroupContestAdminController
  ],
  providers: [ContestService, GroupService]
})
export class ContestModule {}
