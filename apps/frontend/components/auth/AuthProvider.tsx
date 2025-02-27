'use client'

import type { Session } from 'next-auth'
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
      {children}
    </SessionContext.Provider>
  )
}
