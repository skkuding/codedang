import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { GithubStrategy } from 'libs/auth/src/github/github.strategy'
import { KakaoStrategy } from 'libs/auth/src/kakao/kakao.strategy'
import { JwtAuthModule } from '@libs/auth'
import { UserModule } from '@client/user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const options: JwtModuleOptions = {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '10m',
            issuer: 'skkuding.dev'
          }
        }
        return options
      },
      inject: [ConfigService]
    }),
    JwtAuthModule,
    UserModule,
    PassportModule.register({
      strategies: [GithubStrategy, KakaoStrategy]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, KakaoStrategy],
  exports: [AuthService]
})
export class AuthModule {}
