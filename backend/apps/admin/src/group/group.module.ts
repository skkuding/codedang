import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { UserModule } from '@admin/user/user.module'
import { GroupResolver } from './group.resolver'
import { GroupService } from './group.service'

@Module({
  imports: [RolesModule, UserModule],
  providers: [GroupResolver, GroupService]
})
export class GroupModule {}
