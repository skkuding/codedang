import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy]
})
export class JwtAuthModule {}
