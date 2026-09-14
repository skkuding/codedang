import type { Provider } from '@prisma/client'

export interface GithubUser extends Express.User {
  githubId: string
  username: string
  email: string
}

export interface KakaoUser extends Express.User {
  kakaoId: string
}

export interface OAuthTokenPayload {
  oauthId: string
  provider: Provider
}
