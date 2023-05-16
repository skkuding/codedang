import { Module, forwardRef } from '@nestjs/common'
import { AdminUserService } from './user.service'
import { UserResolver } from './user.resolver'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@client/auth/auth.module'

@Module({
  providers: [UserResolver, AdminUserService],
  imports: [
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
    forwardRef(() => AuthModule)
  ]
})
export class UserModule {}
