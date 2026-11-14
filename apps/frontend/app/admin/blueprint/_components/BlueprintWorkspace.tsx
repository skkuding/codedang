'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useContext, type ReactNode } from 'react'
import { blueprintKeys } from '../_libs/queries'
import {
  blueprintKind,
  blueprintListLocation,
  blueprintScope,
  type BlueprintContentKind,
  type BlueprintListLocation
} from '../_libs/routes'
import type {
  BlueprintListScope,
  BlueprintListStateController
} from '../_libs/types'
import { useBlueprintAssignmentListState } from '../_libs/useBlueprintAssignmentListState'
import { useBlueprintRead } from '../_libs/useBlueprintRead'
import { useBlueprintDataSource } from './BlueprintDataSourceProvider'
import { BlueprintShell } from './BlueprintShell'

interface WorkspaceState {
  blueprintId: number
  kind: BlueprintContentKind
  location: BlueprintListLocation
  scope: BlueprintListScope
  viewState: BlueprintListStateController
}

const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function BlueprintWorkspace({
  blueprintId,
  children
}: {
  blueprintId: number
  children: ReactNode
}) {
  const kind = blueprintKind(usePathname())
  const location = blueprintListLocation(useSearchParams())
  const scope = blueprintScope(blueprintId, kind, location)
  const viewState = useBlueprintAssignmentListState(scope)
  const source = useBlueprintDataSource()
  const information = useBlueprintRead(
    blueprintKeys.course(blueprintId),
    source ? () => source.readCourse(blueprintId) : null
  )

  return (
    <WorkspaceContext.Provider
      value={{ blueprintId, kind, location, scope, viewState }}
    >
      <BlueprintShell
        blueprintId={blueprintId}
        kind={kind}
        information={information}
      >
        {children}
      </BlueprintShell>
    </WorkspaceContext.Provider>
  )
}

export function useBlueprintWorkspace() {
  const state = useContext(WorkspaceContext)
  if (state === null) {
    throw new Error('Blueprint routes require BlueprintWorkspace')
  }
  return state
}
