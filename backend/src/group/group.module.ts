import { Module } from '@nestjs/common'
import { UserModule } from 'src/user/user.module'
import {
  GroupAdminController,
  GroupMemberController
} from './group-admin.controller'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  imports: [UserModule],
  controllers: [GroupController, GroupAdminController, GroupMemberController],
  providers: [GroupService],
  exports: [GroupService]
})
export class GroupModule {}
