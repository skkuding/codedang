import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { UserLoader } from './user.loader'
import { GroupMemberResolver, UserResolver } from './user.resolver'
import { GroupMemberService, UserService } from './user.service'

@Module({
  imports: [RolesModule],
  providers: [
    UserResolver,
    UserService,
    UserLoader,
    GroupMemberResolver,
    GroupMemberService
  ],
  exports: [UserService, GroupMemberService, UserLoader]
})
export class UserModule {}
