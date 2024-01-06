import { fetcher } from '@/lib/utils'
import { ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME } from '@/lib/vars'
import type { NextAuthOptions, Session, User } from 'next-auth'
import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const getToken = (res: Response) => {
  const Authorization = res.headers.get('authorization')
  const parsedCookie = parseCookie(res.headers.get('set-cookie') || '')
  const refreshToken = parsedCookie.get('refresh_token')
  return {
    Authorization: Authorization || '',
    refreshToken: refreshToken || ''
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        const res = await fetcher.post('auth/login', {
          json: {
            username: credentials?.username,
            password: credentials?.password
          }
        })
        if (res.ok) {
          const { Authorization, refreshToken } = getToken(res)
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
              refreshToken: refreshToken
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
      const now = Date.now()
      if (user) {
        token.username = user.username
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = now + (ACCESS_TOKEN_EXPIRE_TIME - 60) * 1000
        token.refreshTokenExpires =
          now + (REFRESH_TOKEN_EXPIRE_TIME - 60) * 1000
      }
      // if access token is expired, reissue it
      if (Date.now() >= token.accessTokenExpires) {
        const res = await fetcher.get('auth/reissue', {
          headers: {
            cookie: `refresh_token=${token.refreshToken}`
          }
        })
        if (res.ok) {
          const { Authorization, refreshToken } = getToken(res)
          token.accessToken = Authorization
          token.refreshToken = refreshToken
          token.accessTokenExpires =
            now + (ACCESS_TOKEN_EXPIRE_TIME - 60) * 1000
          token.refreshTokenExpires =
            now + (REFRESH_TOKEN_EXPIRE_TIME - 60) * 1000
        }
      }
      // TODO: Handle refresh token expiration
      return token
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
