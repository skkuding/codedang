import { Module } from '@nestjs/common'
import { GroupModule } from 'src/group/group.module'
import { ContestAdminController } from './contest-admin.controller'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

@Module({
  imports: [GroupModule],
  controllers: [ContestController, ContestAdminController],
  providers: [ContestService]
})
export class ContestModule {}
