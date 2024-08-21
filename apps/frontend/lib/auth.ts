import { getServerSession } from 'next-auth'
import { authOptions } from './auth/authOptions'
import { getClientSession } from './auth/getClientSession'

/**
 * Get session data.
 * @returns {Promise<Session | null>} Session
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth =
  typeof window === 'undefined'
    ? async () => getServerSession(authOptions)
    : getClientSession()
