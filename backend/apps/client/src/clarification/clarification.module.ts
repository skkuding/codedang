import { Module } from '@nestjs/common'
import { ContestModule } from '@client/contest/contest.module'
import { GroupModule } from '@client/group/group.module'
import { UserModule } from '@client/user/user.module'
import {
  ClarificationController,
  GroupClarificationController
} from './clarification.controller'
import { ClarificationService } from './clarification.service'

@Module({
  imports: [UserModule, GroupModule, ContestModule],
  providers: [ClarificationService],
  controllers: [ClarificationController, GroupClarificationController]
})
export class ClarificationModule {}
