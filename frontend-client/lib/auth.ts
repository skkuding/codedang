import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { Token, UserData } from '@/types/next-auth'
import { getServerSession } from 'next-auth'
import { getSession } from 'next-auth/react'

type AuthResult =
  | { isAuth: false; user: null; token: null }
  | { isAuth: true; user: UserData; token: Token }

/** Get the user's authentication status and data.
 * @returns {Promise<{isAuth: boolean, user: any, token: string}>}
 * @throws {Error} if called on the client
 * @example
 * const { isAuth, user, token } = await getAuth()
 * if (isAuth) {
 *  console.log('User is logged in', user)
 * console.log('User token', token)
 * } else {
 * console.log('User is not logged in')
 * }
 */
export const getAuth = async (): Promise<AuthResult> => {
  const session =
    typeof window === 'undefined'
      ? await getServerSession(authOptions) // Server-side: directly get session.
      : await getSession() // Client-side: get session from /api/auth/session.
  // If refresh token is expired, session.user.username will be empty string.
  if (session && session.user.username)
    return { isAuth: true, user: session.user, token: session.token }
  return { isAuth: false, user: null, token: null }
}
