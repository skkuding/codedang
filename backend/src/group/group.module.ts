import { Module } from '@nestjs/common'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
