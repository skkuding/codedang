import type { User } from 'next-auth'

interface SocialCredential {
  username: string
  role: string
  accessToken: string
  accessTokenExpires: string
}

/**
 * Build a NextAuth user from tokens already fetched client-side via /auth/reissue.
 * Unlike the password-based authorize(), this never calls the backend itself —
 * the browser must call /auth/reissue beforehand because the refresh_token cookie
 * is httpOnly and scoped to that path, so only a direct browser request carries it.
 * The literal refreshToken value can't be read back (httpOnly), so it's left empty.
 */
export const authorizeSocial = <C extends Record<string, string>>(
  credential?: C
): User | null => {
  const { username, role, accessToken, accessTokenExpires } = (credential ??
    {}) as unknown as SocialCredential

  if (!username || !role || !accessToken || !accessTokenExpires) {
    return null
  }

  return {
    username,
    role,
    accessToken,
    accessTokenExpires: Number(accessTokenExpires),
    refreshToken: '',
    refreshTokenExpires: 0
  } as User
}
