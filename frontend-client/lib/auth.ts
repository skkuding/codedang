import { fetcher } from '@/lib/utils'
import { ACCESS_TOKEN_EXPIRE_TIME } from '@/lib/vars'
import {
  getServerSession,
  type NextAuthOptions,
  type Session,
  type User
} from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSession } from 'next-auth/react'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const getAuthToken = (res: Response) => {
  const Authorization = res.headers.get('authorization')
  const parsedCookie = parseCookie(res.headers.get('set-cookie') || '')
  const refreshToken = parsedCookie.get('refresh_token')
  const refreshTokenExpires = parsedCookie.get('Expires') as string
  return {
    accessToken: Authorization || '',
    refreshToken: refreshToken || '',
    accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRE_TIME - 1000, // 29 minutes 59 seconds
    refreshTokenExpires: Date.parse(refreshTokenExpires) - 1000 // 23 hours 59 minutes 59 seconds
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
          // If login is successful, get user data.
          const {
            accessToken,
            refreshToken,
            refreshTokenExpires,
            accessTokenExpires
          } = getAuthToken(res)
          const userRes = await fetcher.get('user', {
            headers: {
              Authorization: accessToken
            }
          })
          if (userRes.ok) {
            // If user data is successfully fetched, return user data.
            const user: User = await userRes.json()
            return {
              username: user.username,
              role: user.role,
              accessToken,
              refreshToken,
              accessTokenExpires,
              refreshTokenExpires
            } as User
          }
        }
        // If login is failed
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

/**
 * Get session data.
 * @returns {Promise<Session | null>} Session
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth = async () =>
  typeof window !== 'undefined'
    ? await getSession()
    : await getServerSession(authOptions)
