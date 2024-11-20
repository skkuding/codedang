import { encode, getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { getJWTFromResponse } from './libs/auth/getJWTFromResponse'
import { baseUrl } from './libs/constants'

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'

export const middleware = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Handle unauthorized access to admin page
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    (!token || token.role === 'User')
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Handle reissue of access token
  if (token && token.accessTokenExpires <= Date.now()) {
    try {
      const reissueRes = await fetch(baseUrl + '/auth/reissue', {
        headers: {
          cookie: `refresh_token=${token.refreshToken}`
        },
        cache: 'no-store'
      })

      if (!reissueRes.ok) {
        throw new Error('Failed to reissue token')
      }

      // If reissue is successful, update session token.
      const {
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires
      } = getJWTFromResponse(reissueRes)
      const newToken = await encode({
        secret: process.env.NEXTAUTH_SECRET as string,
        token: {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires,
          refreshTokenExpires
        },
        maxAge: 24 * 60 * 60 // 24 hours
      })

      req.cookies.set(sessionCookieName, newToken)

      const reissuedResponse = NextResponse.next({
        request: {
          headers: new Headers(req.headers)
        }
      })
      reissuedResponse.cookies.set(sessionCookieName, newToken, {
        maxAge: 24 * 60 * 60,
        secure:
          process.env.APP_ENV === 'production' ||
          process.env.APP_ENV === 'stage',
        httpOnly: true,
        sameSite: 'lax'
      })

      return reissuedResponse
    } catch {
      // If reissue is failed, delete session token.
      req.cookies.delete(sessionCookieName)

      const deletedResponse = NextResponse.next({
        request: {
          headers: new Headers(req.headers)
        }
      })
      deletedResponse.cookies.delete(sessionCookieName)

      return deletedResponse
    }
  }
}
