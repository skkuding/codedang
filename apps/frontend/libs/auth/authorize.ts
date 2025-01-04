import type { User } from 'next-auth'
import { safeFetcher } from '../utils'
import { getJWTFromResponse } from './getJWTFromResponse'

/**
 * Authorize user with the credential.
 * @param {Record<string, string>} [credential] Credential - username and password
 * @returns {Promise<User | null>} User - User data
 */
export const authorize = async <C extends Record<string, string>>(
  credential?: C
): Promise<User | null> => {
  // Try to login with the credential.
  try {
    // Login with the credential and get JWT from the response.
    const loginResponse = await safeFetcher.post('auth/login', {
      json: {
        username: credential?.username,
        password: credential?.password
      }
    })
    const {
      accessToken,
      refreshToken,
      refreshTokenExpires,
      accessTokenExpires
    } = getJWTFromResponse(loginResponse)

    // Get user data for getting user role.
    const userResponse = await safeFetcher.get('user', {
      headers: {
        Authorization: accessToken
      }
    })
    const user: User = await userResponse.json()

    return {
      username: user.username,
      role: user.role,
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires
    } as User
  } catch (error) {
    // If failed to login or get user data, then return null. (User is failed to login.)
    return null
  }
}
