import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'passwordReset') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.token_for_password_reset
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')
    })
  }

  async validate(payload: { userId: number; email: string }) {
    return {
      id: payload.userId,
      email: payload.email
    }
  }
}
