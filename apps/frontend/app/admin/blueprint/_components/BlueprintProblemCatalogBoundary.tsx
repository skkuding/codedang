'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext, type ReactNode } from 'react'
import {
  useBlueprintProblemCatalog,
  type BlueprintProblemCatalogController
} from '../_libs/useBlueprintProblemCatalog'

const ProblemCatalogContext =
  createContext<BlueprintProblemCatalogController | null>(null)

export function BlueprintProblemCatalogProvider({
  value,
  children
}: {
  value: BlueprintProblemCatalogController
  children: ReactNode
}) {
  return (
    <ProblemCatalogContext.Provider value={value}>
      {children}
    </ProblemCatalogContext.Provider>
  )
}

function LiveProblemCatalog({
  children
}: {
  children: (catalog: BlueprintProblemCatalogController) => ReactNode
}) {
  const { data: session, status } = useSession()
  const catalog = useBlueprintProblemCatalog({ enabled: Boolean(session) })
  return children(
    session
      ? catalog
      : {
          ...catalog,
          problems: [],
          status: status === 'loading' ? 'loading' : 'unauthenticated'
        }
  )
}

export function BlueprintProblemCatalogBoundary({
  children
}: {
  children: (catalog: BlueprintProblemCatalogController) => ReactNode
}) {
  const supplied = useContext(ProblemCatalogContext)
  return supplied ? (
    children(supplied)
  ) : (
    <LiveProblemCatalog>{children}</LiveProblemCatalog>
  )
}
