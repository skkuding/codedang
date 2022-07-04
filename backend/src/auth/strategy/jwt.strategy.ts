import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'
import { JwtObject } from '../type/jwt.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')
    })
  }

  async validate(payload: JwtObject) {
    const userRole = this.userService.getUserRole(
      payload.userId,
      payload.username
    )
    if (!userRole) {
      throw new UnauthorizedException('Invalid user')
    }

    return { id: payload.userId, username: payload.username, role: userRole }
  }
}
