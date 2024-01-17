import { ACCESS_TOKEN_EXPIRE_TIME } from '@/lib/vars'
import { encode, getToken } from 'next-auth/jwt'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextResponse, type NextRequest } from 'next/server'
import { baseUrl } from './lib/vars'

const getAuthToken = (res: Response) => {
  const Authorization = res.headers.get('authorization') as string
  const parsedCookie = parseCookie(res.headers.get('set-cookie') || '')
  const refreshToken = parsedCookie.get('refresh_token') as string
  const refreshTokenExpires = parsedCookie.get('Expires') as string
  return {
    accessToken: Authorization,
    refreshToken,
    accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRE_TIME - 30 * 1000, // 29 minutes 30 seconds
    refreshTokenExpires: Date.parse(refreshTokenExpires) - 30 * 1000 // 23 hours 59 minutes 30 seconds
  }
}

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'

export const middleware = async (req: NextRequest) => {
  let res = NextResponse.next()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (token && token.accessTokenExpires <= Date.now()) {
    // If access token is expired, reissue access token.
    const reissueRes = await fetch(baseUrl + '/auth/reissue', {
      headers: {
        cookie: `refresh_token=${token.refreshToken}`
      }
    })
    const {
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires
    } = getAuthToken(reissueRes)
    if (reissueRes.ok) {
      // If reissue is successful, update session token.
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
      res = NextResponse.next({
        request: {
          headers: req.headers
        }
      })
      res.cookies.set(sessionCookieName, newToken, {
        // for client setCookie
        maxAge: 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      })
    } else if (token.refreshTokenExpires <= Date.now()) {
      // If reissue is failed and refresh token is expired, delete session token.
      req.cookies.delete(sessionCookieName)
      res = NextResponse.next({
        request: {
          headers: req.headers
        }
      })
      res.cookies.delete(sessionCookieName)
    }
  }
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    (!token || token.role !== 'Admin')
  )
    return NextResponse.redirect(new URL('/', req.url), res)
  return res
}
