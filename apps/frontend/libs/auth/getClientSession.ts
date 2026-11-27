import type { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

export const getClientSession = () => {
  let session: Session | null = null
  let pending: Promise<Session | null> | null = null

  return async () => {
    if (session && session.token.accessTokenExpires >= Date.now()) {
      return session
    }

    pending ??= (async () => {
      try {
        session = await getSession()
        return session
      } finally {
        pending = null
      }
    })()

    return await pending
  }
}
