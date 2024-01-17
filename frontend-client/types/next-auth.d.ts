import type { DefaultSession, DefaultUser } from 'next-auth'

interface UserData {
  username: string
  role: string
}
interface Token {
  accessToken: string
  refreshToken: string
  accessTokenExpires: number
  refreshTokenExpires: number
}

declare module 'next-auth' {
  interface User extends DefaultUser, UserData, Token {}
  interface Session extends DefaultSession {
    user: UserData
    token: Token
  }
}
declare module 'next-auth/jwt' {
  interface JWT extends UserData, Token {}
}
