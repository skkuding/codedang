'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BlueprintManagementSource } from './editTypes'

const ManagementSourceContext = createContext<BlueprintManagementSource | null>(
  null
)

export function BlueprintManagementSourceProvider({
  source,
  children
}: {
  source: BlueprintManagementSource | null
  children: ReactNode
}) {
  return (
    <ManagementSourceContext.Provider value={source}>
      {children}
    </ManagementSourceContext.Provider>
  )
}

export function useBlueprintManagementSource() {
  return useContext(ManagementSourceContext)
}
