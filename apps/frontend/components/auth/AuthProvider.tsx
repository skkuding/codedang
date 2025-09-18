'use client'

import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { createContext, type ReactNode } from 'react'

export const SessionContext = createContext<Session | null | undefined>(
  undefined
)

interface AuthProviderProps {
  children: ReactNode
  session: Session | null
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionContext.Provider value={session}>
      <SessionProvider basePath="/next-auth/api/auth">
        {children}
      </SessionProvider>
    </SessionContext.Provider>
  )
}
