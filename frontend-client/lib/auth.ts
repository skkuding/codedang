import { baseUrl } from '@/lib/vars'
import type { NextAuthOptions, Session, User } from 'next-auth'
import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { fetcher } from './utils'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        const res = await fetch(baseUrl + '/auth/login', {
          method: 'POST',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password
          })
        })
        if (res.ok) {
          const parsedCookie = parseCookie(res.headers.get('set-cookie') || '')
          const Authorization = res.headers.get('authorization')
          const userRes = await fetcher.get('user', {
            headers: {
              Authorization: Authorization || ''
            }
          })
          if (userRes.ok) {
            const user: User = await userRes.json()
            return {
              username: user.username,
              role: user.role,
              accessToken: Authorization,
              refreshToken: parsedCookie.get('refresh_token')
            } as User
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      session.user = {
        username: token.username,
        role: token.role,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      }
      return session
    }
  }
}

export default NextAuth(authOptions)
