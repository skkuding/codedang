import { Module } from '@nestjs/common'
import { AdminUserService } from './user.service'
import { UserResolver } from './user.resolver'

@Module({
  providers: [UserResolver, AdminUserService]
})
export class UserModule {}
