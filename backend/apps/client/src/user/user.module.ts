import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt'
import { EmailModule } from '@client/email/email.module'
import { AuthModule } from '@client/auth/auth.module'
import { GroupModule } from '@client/group/group.module'
import {
  UserController,
  EmailAuthenticationController
} from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const options: JwtModuleOptions = {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '5m',
            issuer: 'skkuding.dev'
          }
        }
        return options
      },
      inject: [ConfigService]
    }),
    forwardRef(() => AuthModule),
    GroupModule,
    EmailModule
  ],
  controllers: [UserController, EmailAuthenticationController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
