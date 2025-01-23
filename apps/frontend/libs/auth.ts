import { getClientSession } from './auth/getClientSession'
import { getServerSession } from './auth/getServerSession'

/**
 * Get session data.
 * @returns {Promise<Session | null>} Session
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth =
  typeof window === 'undefined' ? getServerSession : getClientSession()
