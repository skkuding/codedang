import { getServerSession } from 'next-auth'
import { getSession } from 'next-auth/react'
import { authOptions } from './auth/authOptions'

/**
 * Get session data.
 * @returns {Promise<Session | null>} Session
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth = async () =>
  typeof window !== 'undefined'
    ? await getSession()
    : await getServerSession(authOptions)
