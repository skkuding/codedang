import { Module } from '@nestjs/common'
import { EmailModule } from 'src/email/email.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
