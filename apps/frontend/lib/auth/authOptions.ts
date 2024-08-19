import type { NextAuthOptions, Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authorize } from './authorize'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      authorize
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        // When user logs in, set token. (Only when user tries to login, user will not be undefined.)
        token.username = user.username
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = user.accessTokenExpires
        token.refreshTokenExpires = user.refreshTokenExpires
      }

      return token
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      // When user requests session, then call jwt callback. and then call this callback.
      session.user = {
        username: token.username,
        role: token.role
      }

      session.token = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        accessTokenExpires: token.accessTokenExpires,
        refreshTokenExpires: token.refreshTokenExpires
      }

      return session
    }
  }
}
