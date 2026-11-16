'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BlueprintCreateSource } from '../_libs/createTypes'

const CreateSourceContext = createContext<BlueprintCreateSource | null>(null)

export function BlueprintCreateSourceProvider({
  source,
  children
}: {
  source: BlueprintCreateSource
  children: ReactNode
}) {
  return (
    <CreateSourceContext.Provider value={source}>
      {children}
    </CreateSourceContext.Provider>
  )
}

export function useBlueprintCreateSource() {
  return useContext(CreateSourceContext)
}
