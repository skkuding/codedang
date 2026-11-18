import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { middleware } from './middleware'

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn(), encode: vi.fn() }))
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ cookies: { delete: vi.fn(), set: vi.fn() } }))
  }
}))

describe('refresh token reissue in middleware', () => {
  const request = () =>
    ({
      nextUrl: { pathname: '/', searchParams: new URLSearchParams() },
      headers: new Headers(),
      cookies: { set: vi.fn(), delete: vi.fn() }
    }) as unknown as NextRequest

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getToken).mockResolvedValue({
      username: 'user',
      role: 'User',
      accessToken: 'expired-access-token',
      accessTokenExpires: 0,
      refreshToken: 'old-refresh-token',
      refreshTokenExpires: Date.now() + 60_000
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves the session cookie when another request just rotated it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 409, ok: false })
    )
    const req = request()

    const response = await middleware(req)

    expect(req.cookies.delete).not.toHaveBeenCalled()
    expect(response?.cookies.delete).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalledWith()
  })

  it('deletes the session cookie for an invalid refresh token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 401, ok: false })
    )
    const req = request()

    const response = await middleware(req)

    expect(req.cookies.delete).toHaveBeenCalled()
    expect(response?.cookies.delete).toHaveBeenCalled()
  })
})
