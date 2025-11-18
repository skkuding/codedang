import { ALL_LANGUAGES, DEFAULT_LANGUAGE } from '@/tolgee/shared'
import { encode, getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { getJWTFromResponse } from './libs/auth/getJWTFromResponse'
import { baseUrl } from './libs/constants'

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'

const intlMiddleware = createMiddleware({
  locales: ALL_LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: 'as-needed'
})

export const middleware = async (req: NextRequest) => {
  const response = intlMiddleware(req)

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = req.nextUrl

  const isCourseDetailPath = /^(\/[a-z]{2})?\/course\/.+/.test(pathname)

  if (isCourseDetailPath && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (req.nextUrl.searchParams.get('isPWA') === 'true') {
    console.log(
      JSON.stringify(
        {
          event: 'PWA',
          timestamp: new Date().toISOString(),
          path: pathname,
          user: {
            username: token?.username,
            name: token?.name,
            role: token?.role
          },
          ip: req.headers.get('x-real-ip'),
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer')
        },
        null,
        0
      )
    )
  }

  if (token && token.accessTokenExpires <= Date.now()) {
    // Handle unauthorized access to admin page
    // if (
    //   req.nextUrl.pathname.startsWith('/admin') &&
    //   (!token || token.role === 'User')
    // ) {
    //   return NextResponse.redirect(new URL('/', req.url))
    // }

    // Handle reissue of access token
    try {
      const reissueRes = await fetch(`${baseUrl}/auth/reissue`, {
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

      response.cookies.set(sessionCookieName, newToken, {
        maxAge: 24 * 60 * 60,
        secure:
          process.env.APP_ENV === 'production' ||
          process.env.APP_ENV === 'stage',
        httpOnly: true,
        sameSite: 'lax'
      })

      return response
    } catch {
      // If reissue is failed, delete session token.
      req.cookies.delete(sessionCookieName)

      response.cookies.delete(sessionCookieName)

      return response
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
