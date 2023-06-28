import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestModule } from '@client/contest/contest.module'
import { GroupModule } from '@client/group/group.module'
import {
  ClarificationController,
  GroupClarificationController
} from './clarification.controller'
import { ClarificationService } from './clarification.service'

@Module({
  imports: [RolesModule, GroupModule, ContestModule],
  providers: [ClarificationService],
  controllers: [ClarificationController, GroupClarificationController]
})
export class ClarificationModule {}
