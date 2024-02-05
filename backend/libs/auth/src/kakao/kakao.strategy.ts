import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-kakao'
import { KAKAO_CALLBACK_URL } from '@libs/constants'

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  private readonly logger = new Logger(KakaoStrategy.name)

  constructor(private readonly config: ConfigService) {
    super({
      clientID:
        config.get('KAKAO_CLIENT_ID') || config.get('KAKAO_REST_API_KEY'),
      // Leave KAKAO_REST_API_KEY for backward compatibility (for local development)
      clientSecret: config.get('KAKAO_CLIENT_SECRET'),
      callbackURL: KAKAO_CALLBACK_URL
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(accessToken: string, refreshToken: string, profile: any) {
    const id = profile.id // kakao id(고유번호)
    const username = profile.username // kakao에 등록된 이름

    return {
      kakaoId: id,
      username
    }
  }
}
