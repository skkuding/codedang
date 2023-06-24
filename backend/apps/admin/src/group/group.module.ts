import { Module } from '@nestjs/common'
import { GroupResolver } from './group.resolver'
import { GroupService } from './group.service'

@Module({
  providers: [GroupResolver, GroupService]
})
export class GroupModule {}
