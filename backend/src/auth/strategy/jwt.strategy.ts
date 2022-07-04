import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'
import { AuthService } from '../auth.service'
import { AUTH_TYPE } from '../config/jwt.config'
import { JwtObject, VerifiedUser } from '../type/jwt.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: JwtObject): Promise<VerifiedUser> {
    //cache balcklist검사
    const accessToken = req.get('authorization').replace(`${AUTH_TYPE} `, '')
    if (!(await this.authService.isUnavailableToken(accessToken))) {
      throw new UnauthorizedException('Invalid Token')
    }

    const user = await this.userService.getUserRole(
      payload.userId,
      payload.username
    )
    if (!user) {
      throw new UnauthorizedException('Invalid user')
    }

    return {
      id: payload.userId,
      username: payload.username,
      role: user.role
    }
  }
}
