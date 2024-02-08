import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupResolver } from './group.resolver'
import { GroupService } from './group.service'

@Module({
  imports: [RolesModule],
  providers: [GroupResolver, GroupService],
  exports: [GroupService]
})
export class GroupModule {}
