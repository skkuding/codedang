import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [RolesModule],
  controllers: [ContestController],
  providers: [
    ContestService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ],
  exports: [ContestService]
})
export class ContestModule {}
