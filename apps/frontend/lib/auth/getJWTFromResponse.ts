import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { getJWTExpire } from './getJWTExpire'

interface JWTs {
  accessToken: string
  refreshToken: string
  accessTokenExpires: number
  refreshTokenExpires: number
}

/**
 * @param {Response} res - Response object from fetch
 * @returns {JWTs} - Object containing access token, refresh token, and their expiration dates
 * @throws {Error} - Throws error if response does not contain access token, cookie, refresh token, or expiration date
 * @example
 * const tokens = getJWTFromResponse(res)
 * console.log(tokens)
 * // {
 * //   accessToken
 * //   refreshToken
 * //   accessTokenExpires
 * //   refreshTokenExpires
 * // }
 */
export const getJWTFromResponse = (res: Response): JWTs => {
  const accessToken = res.headers.get('authorization')
  const cookies = res.headers.get('set-cookie')

  if (accessToken == null) {
    throw new Error('Response does not contain an access token')
  }

  if (cookies == null) {
    throw new Error('Response does not contain a cookie')
  }

  const accessTokenExpires = getJWTExpire(accessToken)

  const parsedCookie = parseCookie(cookies)
  const refreshToken = parsedCookie.get('refresh_token')
  const refreshTokenExpires = parsedCookie.get('Expires')

  if (refreshToken == null || refreshTokenExpires == null) {
    throw new Error(
      'Response does not contain a valid refresh token or expiration date'
    )
  }

  const tokens = {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires: Date.parse(refreshTokenExpires)
  }

  return tokens
}
