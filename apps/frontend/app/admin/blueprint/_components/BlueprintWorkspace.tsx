'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useContext, type ReactNode } from 'react'
import { blueprintKeys } from '../_libs/queries'
import {
  blueprintKind,
  blueprintDetailHref,
  blueprintListHref,
  blueprintListLocation,
  blueprintScope,
  parseBlueprintId,
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
import { BlueprintNoticeWorkspace } from './BlueprintNoticeWorkspace'
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
  const pathname = usePathname()
  const kind = blueprintKind(pathname)
  const location = blueprintListLocation(useSearchParams())
  const source = useBlueprintDataSource()
  const editId =
    kind !== 'notice' && pathname.endsWith('/edit')
      ? parseBlueprintId(pathname.split('/')[5] ?? '')
      : null
  const information = useBlueprintRead(
    blueprintKeys.course(blueprintId),
    source ? () => source.readCourse(blueprintId) : null
  )

  const content =
    kind === 'notice' ? (
      <BlueprintNoticeWorkspace blueprintId={blueprintId} location={location}>
        {children}
      </BlueprintNoticeWorkspace>
    ) : (
      <AssignmentWorkspace
        blueprintId={blueprintId}
        kind={kind}
        location={location}
      >
        {children}
      </AssignmentWorkspace>
    )

  return (
    <BlueprintShell
      blueprintId={blueprintId}
      kind={kind}
      information={information}
      creation={kind !== 'notice' && pathname.endsWith('/create')}
      editing={editId !== null}
      listHref={
        editId !== null && kind !== 'notice'
          ? blueprintDetailHref(blueprintId, kind, editId, location)
          : blueprintListHref(blueprintId, kind, location)
      }
    >
      {content}
    </BlueprintShell>
  )
}

function AssignmentWorkspace({
  blueprintId,
  kind,
  location,
  children
}: {
  blueprintId: number
  kind: BlueprintContentKind
  location: BlueprintListLocation
  children: ReactNode
}) {
  const scope = blueprintScope(blueprintId, kind, location)
  const viewState = useBlueprintAssignmentListState(scope)
  return (
    <WorkspaceContext.Provider
      value={{ blueprintId, kind, location, scope, viewState }}
    >
      {children}
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
