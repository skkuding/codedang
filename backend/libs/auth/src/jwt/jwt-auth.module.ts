import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthService } from './jwt-auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [PassportModule],
  providers: [JwtAuthService, JwtStrategy],
  exports: [JwtAuthService]
})
export class JwtAuthModule {}
