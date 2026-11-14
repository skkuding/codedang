import { encode, getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { baseUrl } from './libs/constants'
import { middleware } from './middleware'

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn(), encode: vi.fn() }))

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'
const blueprintTarget =
  '/admin/blueprint/51/exercise/191?cursor=190&take=2&page=2'

const request = (path: string, sessionToken?: string) =>
  new NextRequest(new URL(path, 'https://test.com'), {
    headers: sessionToken
      ? { cookie: `${sessionCookieName}=${sessionToken}` }
      : undefined
  })

vi.spyOn(NextResponse, 'next')
vi.spyOn(NextResponse, 'redirect')

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Blueprint login boundary', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockResolvedValue(null)
  })

  it.each([
    '/admin/blueprint',
    '/admin/blueprint/51',
    '/admin/blueprint/51/assignment',
    blueprintTarget
  ])(
    'redirects anonymous visitors and preserves the full Blueprint target: %s',
    async (path) => {
      const response = await middleware(request(path))

      expect(NextResponse.redirect).toHaveBeenCalledOnce()
      const redirect = new URL(response?.headers.get('location') ?? '')
      expect(redirect.pathname).toBe('/login')
      expect(redirect.searchParams.get('redirectUrl')).toBe(path)
      expect(NextResponse.next).not.toHaveBeenCalled()
    }
  )

  it('lets an authenticated Blueprint request continue normally', async () => {
    vi.mocked(getToken).mockResolvedValue({
      username: 'user',
      role: 'User',
      accessToken: 'valid-access-token',
      accessTokenExpires: Date.now() + 60_000,
      refreshToken: 'refresh-token',
      refreshTokenExpires: Date.now() + 120_000
    })

    expect(
      await middleware(request('/admin/blueprint/51/assignment/91?take=10'))
    ).toBeUndefined()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it.each(['/admin/course/51', '/admin', '/admin/blueprintish/51'])(
    'keeps the existing anonymous handling outside Blueprint unchanged: %s',
    async (path) => {
      expect(await middleware(request(path))).toBeUndefined()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    }
  )

  it('preserves the existing client Course redirect without changing its query behavior', async () => {
    const response = await middleware(request('/course/51?tab=assignment'))

    expect(
      new URL(response?.headers.get('location') ?? '').searchParams.get(
        'redirectUrl'
      )
    ).toBe('/course/51')
  })
})

describe('refresh token reissue in middleware', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockResolvedValue({
      username: 'user',
      role: 'User',
      accessToken: 'expired-access-token',
      accessTokenExpires: Date.now() - 60_000,
      refreshToken: 'old-refresh-token',
      refreshTokenExpires: Date.now() + 60_000
    })
  })

  const stubReissueFailure = (failure: 'HTTP' | 'network') => {
    const fetch = vi.fn()
    if (failure === 'HTTP') {
      fetch.mockResolvedValue(new Response(null, { status: 401 }))
    } else {
      fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    }
    vi.stubGlobal('fetch', fetch)
    return fetch
  }

  it.each(['/', blueprintTarget])(
    'preserves the session cookie when another request just rotated it: %s',
    async (path) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response(null, { status: 409 }))
      )
      const req = request(path, 'existing-session-token')

      const response = await middleware(req)

      expect(req.cookies.get(sessionCookieName)?.value).toBe(
        'existing-session-token'
      )
      expect(response?.cookies.get(sessionCookieName)).toBeUndefined()
      expect(NextResponse.next).toHaveBeenCalledWith()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    }
  )

  describe.each([
    '/admin/blueprint/51/assignment?cursor=190&take=2&page=2',
    '/admin/blueprint/51/assignment/191?cursor=190&take=2&page=2',
    '/admin/blueprint/51/exercise?cursor=190&take=2&page=2',
    blueprintTarget
  ])('expired Blueprint session at %s', (path) => {
    it.each(['HTTP', 'network'] as const)(
      'redirects to login with the full return target after a %s failure',
      async (failure) => {
        const fetch = stubReissueFailure(failure)
        const req = request(path, 'expired-session-token')

        const response = await middleware(req)

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/auth/reissue`, {
          headers: { cookie: 'refresh_token=old-refresh-token' },
          cache: 'no-store'
        })
        const redirect = new URL(response?.headers.get('location') ?? '')
        expect(redirect.pathname).toBe('/login')
        expect(redirect.searchParams.get('redirectUrl')).toBe(path)
        expect(req.cookies.has(sessionCookieName)).toBe(false)
        expect(response?.cookies.get(sessionCookieName)).toMatchObject({
          value: '',
          expires: new Date(0),
          secure: true
        })
        expect(response?.headers.get('set-cookie')).toMatch(/;\s*Secure(?:;|$)/)
        expect(NextResponse.next).not.toHaveBeenCalled()
      }
    )
  })

  it('continues a Blueprint request with the rotated session after successful reissue', async () => {
    const accessTokenExpires = Math.floor(Date.now() / 1000) * 1000 + 60_000
    const refreshTokenExpires = accessTokenExpires + 60_000
    const accessToken = [
      Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url'),
      Buffer.from(JSON.stringify({ exp: accessTokenExpires / 1000 })).toString(
        'base64url'
      ),
      'signature'
    ].join('.')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, {
          headers: {
            authorization: accessToken,
            'set-cookie': `refresh_token=new-refresh-token; Expires=${new Date(refreshTokenExpires).toUTCString()}; HttpOnly; Path=/`
          }
        })
      )
    )
    vi.mocked(encode).mockResolvedValue('rotated-session-token')
    const req = request(blueprintTarget, 'expired-session-token')

    const response = await middleware(req)

    expect(encode).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.objectContaining({
          accessToken,
          refreshToken: 'new-refresh-token',
          accessTokenExpires,
          refreshTokenExpires
        })
      })
    )
    expect(req.cookies.get(sessionCookieName)?.value).toBe(
      'rotated-session-token'
    )
    expect(response?.cookies.get(sessionCookieName)?.value).toBe(
      'rotated-session-token'
    )
    expect(response?.headers.get('x-middleware-request-cookie')).toBe(
      `${sessionCookieName}=rotated-session-token`
    )
    expect(NextResponse.next).toHaveBeenCalledOnce()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it.each([
    ['/', 'HTTP'],
    ['/course/51?tab=assignment', 'HTTP'],
    ['/course/51?tab=assignment', 'network'],
    ['/admin/course/51', 'HTTP'],
    ['/admin/course/51', 'network'],
    ['/admin/problem', 'HTTP'],
    ['/admin/problem', 'network'],
    ['/admin/blueprintish/51', 'HTTP']
  ] as const)(
    'clears an expired session and continues the existing non-Blueprint flow: %s (%s failure)',
    async (path, failure) => {
      stubReissueFailure(failure)
      const req = request(path, 'expired-session-token')

      const response = await middleware(req)

      expect(req.cookies.has(sessionCookieName)).toBe(false)
      expect(response?.cookies.get(sessionCookieName)).toMatchObject({
        value: '',
        expires: new Date(0)
      })
      expect(response?.headers.get('x-middleware-request-cookie')).toBe('')
      expect(NextResponse.next).toHaveBeenCalledOnce()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    }
  )

  it('clears the plain session cookie for Blueprint refresh failures under HTTP', async () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:5525/api/auth')
    vi.resetModules()
    const { middleware: httpMiddleware } = await import('./middleware')
    stubReissueFailure('HTTP')
    const plainSessionCookieName = 'next-auth.session-token'
    const req = new NextRequest(
      new URL(blueprintTarget, 'http://localhost:5525'),
      {
        headers: { cookie: `${plainSessionCookieName}=expired-session-token` }
      }
    )

    const response = await httpMiddleware(req)

    const redirect = new URL(response?.headers.get('location') ?? '')
    expect(redirect.origin).toBe('http://localhost:5525')
    expect(redirect.pathname).toBe('/login')
    expect(redirect.searchParams.get('redirectUrl')).toBe(blueprintTarget)
    expect(req.cookies.has(plainSessionCookieName)).toBe(false)
    expect(response?.cookies.get(plainSessionCookieName)).toMatchObject({
      value: '',
      expires: new Date(0),
      secure: false
    })
    expect(response?.headers.get('set-cookie')).not.toMatch(/;\s*Secure(?:;|$)/)
    expect(NextResponse.next).not.toHaveBeenCalled()
  })
})
