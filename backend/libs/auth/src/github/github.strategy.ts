import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { GITHUB_CALLBACK_URL } from 'libs/constants/src/oauth.constants'
import { Strategy } from 'passport-github2'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: GITHUB_CALLBACK_URL
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails ? profile.emails[0].value : null
    }
  }
}
