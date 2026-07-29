import { baseUrl } from '../constants'
import { getJWTFromResponse } from './getJWTFromResponse'

export interface ReissuedTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpires: number
  refreshTokenExpires: number
}

// Coalesces concurrent refreshes handled by the same server instance.
// Cross-instance concurrency must still be handled idempotently by the backend.
const pendingReissues = new Map<string, Promise<ReissuedTokens>>()

const requestReissue = async (
  refreshToken: string
): Promise<ReissuedTokens> => {
  const response = await fetch(`${baseUrl}/auth/reissue`, {
    headers: {
      cookie: `refresh_token=${refreshToken}`
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to reissue token')
  }

  return getJWTFromResponse(response)
}

export const reissueAccessToken = (
  refreshToken: string
): Promise<ReissuedTokens> => {
  const pending = pendingReissues.get(refreshToken)
  if (pending) {
    return pending
  }

  const reissue = (async () => {
    try {
      return await requestReissue(refreshToken)
    } finally {
      pendingReissues.delete(refreshToken)
    }
  })()

  pendingReissues.set(refreshToken, reissue)
  return reissue
}
