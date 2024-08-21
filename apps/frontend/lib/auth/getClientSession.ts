import type { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

export const getClientSession = () => {
  let session: Session | null = null

  return async () => {
    if (!session || session.token.accessTokenExpires < Date.now()) {
      session = await getSession()
    }

    return session
  }
}
