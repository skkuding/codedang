'use client'

import type { ProblemDetail } from '@/types/type'
import { createContext, useContext } from 'react'

interface ProblemContextType {
  problem: ProblemDetail
}

const ProblemContext = createContext<ProblemContextType | null>(null)

export function ProblemProvider({
  children,
  problem
}: {
  children: React.ReactNode
  problem: ProblemDetail
}) {
  return (
    <ProblemContext.Provider value={{ problem }}>
      {children}
    </ProblemContext.Provider>
  )
}

export function useProblem() {
  const context = useContext(ProblemContext)
  if (!context) {
    throw new Error('useProblem must be used within a ProblemProvider')
  }
  return context
}
