import { fetcher } from '@/lib/utils'
import { ACCESS_TOKEN_EXPIRE_TIME } from '@/lib/vars'
import type { Token, UserData } from '@/types/next-auth'
import { getServerSession } from 'next-auth'
import type { NextAuthOptions, Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSession } from 'next-auth/react'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const getToken = (res: Response) => {
  const Authorization = res.headers.get('authorization')
  const parsedCookie = parseCookie(res.headers.get('set-cookie') || '')
  const refreshToken = parsedCookie.get('refresh_token')
  const refreshTokenExpires = parsedCookie.get('Expires') as string
  return {
    accessToken: Authorization || '',
    refreshToken: refreshToken || '',
    accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRE_TIME * 1000 - 1000, // 29 minutes 59 seconds
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
          } = getToken(res)
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
      } else if (token.refreshTokenExpires) {
        // When user is logged in and request session
        if (Date.now() >= token.accessTokenExpires) {
          // if access token is expired, reissue it
          const res = await fetcher.get('auth/reissue', {
            headers: {
              cookie: `refresh_token=${token.refreshToken}`
            }
          })
          if (res.ok) {
            // If reissue is successful, update token.
            const {
              accessToken,
              refreshToken,
              refreshTokenExpires,
              accessTokenExpires
            } = getToken(res)
            token.accessToken = accessToken
            token.refreshToken = refreshToken
            token.accessTokenExpires = accessTokenExpires
            token.refreshTokenExpires = refreshTokenExpires
          } else {
            // If reissue is failed, delete token.
            token.username = ''
            token.role = ''
            token.accessToken = ''
            token.refreshToken = ''
            token.accessTokenExpires = 0
            token.refreshTokenExpires = 0
          }
        }
        if (Date.now() >= token.refreshTokenExpires) {
          // If refresh token is expired, delete token.
          token.username = ''
          token.role = ''
          token.accessToken = ''
          token.refreshToken = ''
          token.accessTokenExpires = 0
          token.refreshTokenExpires = 0
        }
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

type AuthResult =
  | { isAuth: false; user: null; token: null }
  | { isAuth: true; user: UserData; token: Token }

/** Get the user's authentication status and data.
 * @returns {Promise<{isAuth: boolean, user: any, token: string}>}
 * @throws {Error} if called on the client
 * @example
 * const { isAuth, user, token } = await getAuth()
 * if (isAuth) {
 *  console.log('User is logged in', user)
 * console.log('User token', token)
 * } else {
 * console.log('User is not logged in')
 * }
 */
export const getAuth = async (): Promise<AuthResult> => {
  const session =
    typeof window === 'undefined'
      ? await getServerSession(authOptions) // Server-side: directly get session.
      : await getSession() // Client-side: get session from /api/auth/session.
  // If refresh token is expired, session.user.username will be empty string.
  if (session && session.token.refreshTokenExpires)
    return { isAuth: true, user: session.user, token: session.token }
  return { isAuth: false, user: null, token: null }
}
