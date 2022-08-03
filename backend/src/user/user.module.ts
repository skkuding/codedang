import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { EmailModule } from 'src/email/email.module'
import { PasswordResetJwtStrategy } from './strategy/jwt-password-reset.strategy'
import { UserController } from './user.controller'
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
    })
  ],
  controllers: [UserController],
  providers: [UserService, PasswordResetJwtStrategy],
  exports: [UserService]
})
export class UserModule {}
