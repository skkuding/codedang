import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile } from 'passport-kakao'

@Injectable()
export class KakaoLinkStrategy extends PassportStrategy(
  Strategy,
  'kakao-link'
) {
  constructor(private readonly config: ConfigService) {
    super({
      clientID:
        config.get('KAKAO_CLIENT_ID') ??
        config.getOrThrow('KAKAO_REST_API_KEY'),
      clientSecret: config.getOrThrow('KAKAO_CLIENT_SECRET'),
      callbackURL: config.getOrThrow('KAKAO_LINK_CALLBACK_URL')
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      kakaoId: String(profile.id)
    }
  }
}
