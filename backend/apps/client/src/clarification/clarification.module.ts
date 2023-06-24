import { Module } from '@nestjs/common'
import { ClarificationService } from './clarification.service'
import { ClarificationController } from './clarification.controller'
import { UserModule } from '@client/user/user.module'
import { GroupModule } from '@client/group/group.module'
import { ContestModule } from '@client/contest/contest.module'

@Module({
  imports: [UserModule, GroupModule, ContestModule],
  providers: [ClarificationService],
  controllers: [ClarificationController]
})
export class ClarificationModule {}
