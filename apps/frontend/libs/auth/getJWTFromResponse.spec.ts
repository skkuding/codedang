import { describe, it, expect } from 'vitest'
import { getJWTFromResponse } from './getJWTFromResponse'

describe('getJWTFromResponse', () => {
  it('should return an object containing access token, refresh token, and their expiration dates', () => {
    const res = new Response(undefined, {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'set-cookie':
          'refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMzAyODM3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.BdV0hk0r_1bVIdxKyer8kzZzhSS_k4d8zvTnD28Jpy0; Max-Age=86400; Path=/api/auth/reissue; Expires=Wed, 07 Aug 2024 10:59:30 GMT; HttpOnly; Secure; SameSite=None; Secure'
      }
    })
    const actual = getJWTFromResponse(res)
    const expected = {
      accessToken:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMzAyODM3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.BdV0hk0r_1bVIdxKyer8kzZzhSS_k4d8zvTnD28Jpy0',
      accessTokenExpires: 1722943770000,
      refreshTokenExpires: 1723028370000
    }

    expect(actual).toEqual(expected)
  })

  it('should throw an error if the response does not contain an access token', () => {
    const res = new Response(undefined, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'set-cookie': 'refresh_token=eyJhbGciOi...'
      }
    })

    expect(() => getJWTFromResponse(res)).toThrowError(
      'Response does not contain an access token'
    )
  })

  it('should throw an error if the response does not contain a cookie', () => {
    const res = new Response(undefined, {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA'
      }
    })

    expect(() => getJWTFromResponse(res)).toThrowError(
      'Response does not contain a cookie'
    )
  })

  it('should throw an error if the response does not contain a valid refresh token or expiration date', () => {
    const res = new Response(undefined, {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'set-cookie': 'foo=bar; Max-Age=86400;'
      }
    })

    expect(() => getJWTFromResponse(res)).toThrowError(
      'Response does not contain a valid refresh token or expiration date'
    )
  })
})
