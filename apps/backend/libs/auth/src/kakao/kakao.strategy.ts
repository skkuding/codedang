import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile } from 'passport-kakao'

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  private readonly logger = new Logger(KakaoStrategy.name)

  constructor(private readonly config: ConfigService) {
    super({
      clientID:
        config.getOrThrow('KAKAO_CLIENT_ID') ||
        config.getOrThrow('KAKAO_REST_API_KEY'),
      // Leave KAKAO_REST_API_KEY for backward compatibility (for local development)
      clientSecret: config.get('KAKAO_CLIENT_SECRET'),
      callbackURL: config.getOrThrow('KAKAO_CALLBACK_URL')
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const id = profile.id

    return {
      kakaoId: id
    }
  }
}
