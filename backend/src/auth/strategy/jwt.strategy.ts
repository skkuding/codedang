import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { JwtObject } from '../interface/jwt.interface'
import { AuthenticatedUser } from '../interface/authenticated-user.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')
    })
  }

  async validate(payload: JwtObject): Promise<AuthenticatedUser> {
    return {
      id: payload.userId,
      username: payload.username
    }
  }
}
