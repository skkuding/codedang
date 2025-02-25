import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupMemberResolver, UserResolver } from './user.resolver'
import { GroupMemberService, UserService } from './user.service'

@Module({
  imports: [RolesModule],
  providers: [
    UserResolver,
    UserService,
    GroupMemberResolver,
    GroupMemberService
  ],
  exports: [UserService, GroupMemberService]
})
export class UserModule {}
