import type { DefaultSession, DefaultUser } from 'next-auth'

interface UserData {
  username: string
  role: string
}
interface AccessToken {
  accessToken: string
  accessTokenExpires: number
}
interface Token extends AccessToken {
  refreshToken: string
  refreshTokenExpires: number
}

declare module 'next-auth' {
  interface User extends DefaultUser, UserData, Token {}
  interface Session extends DefaultSession {
    user: UserData
    token: AccessToken
  }
}
declare module 'next-auth/jwt' {
  interface JWT extends UserData, Token {}
}
