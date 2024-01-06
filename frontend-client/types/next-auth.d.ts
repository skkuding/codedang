import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    username: string
    role: string
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    refreshTokenExpires: number
  }
  interface Session extends DefaultSession {
    user: {
      username: string
      role: string
    }
    token: {
      accessToken: string
      refreshToken: string
      accessTokenExpires: number
      refreshTokenExpires: number
    }
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    role: string
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    refreshTokenExpires: number
  }
}
