import { encode, getToken } from 'next-auth/jwt'
import type { JWT } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { reissueAccessToken } from './libs/auth/reissueAccessToken'

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'

const sessionCookieOptions = {
  maxAge: 24 * 60 * 60,
  secure:
    process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage',
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/'
}

const isProtectedCoursePath = (pathname: string) =>
  /^\/course\/.+/.test(pathname)

const createLoginUrl = (req: NextRequest) => {
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('redirectUrl', req.nextUrl.pathname)
  return loginUrl
}

const logPwaAccess = (req: NextRequest, token: JWT | null) => {
  if (req.nextUrl.searchParams.get('isPWA') !== 'true') {
    return
  }

  console.log(
    JSON.stringify({
      event: 'PWA',
      timestamp: new Date().toISOString(),
      path: req.nextUrl.pathname,
      user: {
        username: token?.username,
        name: token?.name,
        role: token?.role
      },
      ip: req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer')
    })
  )
}

const clearSession = (req: NextRequest, response: NextResponse) => {
  req.cookies.delete(sessionCookieName)
  response.cookies.delete(sessionCookieName)
  return response
}

const handleReissueFailure = (req: NextRequest) => {
  const { pathname } = req.nextUrl
  const isAuthRequest = pathname.startsWith('/next-auth/api/auth/')

  if (pathname === '/login' || isAuthRequest) {
    return clearSession(
      req,
      NextResponse.next({
        request: {
          headers: new Headers(req.headers)
        }
      })
    )
  }

  return clearSession(req, NextResponse.redirect(createLoginUrl(req)))
}

export const middleware = async (req: NextRequest) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = req.nextUrl

  if (isProtectedCoursePath(pathname) && !token) {
    return NextResponse.redirect(createLoginUrl(req))
  }

  logPwaAccess(req, token)

  if (token && token.accessTokenExpires <= Date.now()) {
    if (token.refreshTokenExpires <= Date.now()) {
      return handleReissueFailure(req)
    }

    try {
      const {
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires
      } = await reissueAccessToken(token.refreshToken)

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
      reissuedResponse.cookies.set(
        sessionCookieName,
        newToken,
        sessionCookieOptions
      )

      return reissuedResponse
    } catch {
      return handleReissueFailure(req)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)'
  ]
}
