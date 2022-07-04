import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { JwtObject } from '../type/jwt.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')
    })
  }

  // req.user object에 이게 들어감!
  async validate(payload: JwtObject) {
    // validation logic 추가하기. 지금은 그냥 바로 뱉어버림
    // userId와 username으로 user가 존재하는지 확인, 있다면 role이 추가된 무언가를 return해서
    // req.user로 사용할 수 있도록 함
    return { userId: payload.userId, username: payload.username }
  }
}
