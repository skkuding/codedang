import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      username: string
      role: string
      accessToken: string
      refreshToken: string
    }
  }

  interface User extends DefaultUser {
    username: string
    role: string
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    role: string
    accessToken: string
    refreshToken: string
  }
}
