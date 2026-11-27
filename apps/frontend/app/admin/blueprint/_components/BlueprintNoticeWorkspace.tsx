'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BlueprintNoticeScope } from '../_libs/noticeTypes'
import type { BlueprintListLocation } from '../_libs/routes'
import type { BlueprintListStateController } from '../_libs/types'
import { useBlueprintAssignmentListState } from '../_libs/useBlueprintAssignmentListState'

interface NoticeWorkspaceState {
  blueprintId: number
  location: BlueprintListLocation
  scope: BlueprintNoticeScope
  viewState: BlueprintListStateController
}

const NoticeWorkspaceContext = createContext<NoticeWorkspaceState | null>(null)

export function BlueprintNoticeWorkspace({
  blueprintId,
  location,
  children
}: {
  blueprintId: number
  location: BlueprintListLocation
  children: ReactNode
}) {
  const scope: BlueprintNoticeScope = {
    kind: 'notice',
    blueprintCourseId: blueprintId,
    ...location
  }
  const viewState = useBlueprintAssignmentListState(scope)
  return (
    <NoticeWorkspaceContext.Provider
      value={{ blueprintId, location, scope, viewState }}
    >
      {children}
    </NoticeWorkspaceContext.Provider>
  )
}

export function useBlueprintNoticeWorkspace() {
  const workspace = useContext(NoticeWorkspaceContext)
  if (!workspace) {
    throw new Error('Notice routes require BlueprintNoticeWorkspace')
  }
  return workspace
}
