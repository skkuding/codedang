'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BlueprintDataSource } from '../_libs/types'

const DataSourceContext = createContext<BlueprintDataSource | null>(null)

export function BlueprintDataSourceProvider({
  source,
  children
}: {
  source: BlueprintDataSource
  children: ReactNode
}) {
  return (
    <DataSourceContext.Provider value={source}>
      {children}
    </DataSourceContext.Provider>
  )
}

export function useBlueprintDataSource() {
  return useContext(DataSourceContext)
}
