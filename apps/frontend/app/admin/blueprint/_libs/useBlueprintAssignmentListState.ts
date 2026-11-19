'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  BlueprintListScope,
  BlueprintListStateController,
  BlueprintListViewState
} from './types'

const emptyState: BlueprintListViewState = {
  search: '',
  selectedIds: [],
  expandedIds: []
}

export function useBlueprintAssignmentListState(
  scope: BlueprintListScope
): BlueprintListStateController {
  const key = `${scope.blueprintCourseId}:${scope.isExercise}:${scope.cursor}:${scope.take}:${scope.page ?? 1}`
  const [stored, setStored] = useState({ key, value: emptyState })

  useEffect(() => {
    setStored((current) =>
      current.key === key ? current : { key, value: emptyState }
    )
  }, [key])

  const onChange = useCallback<BlueprintListStateController['onChange']>(
    (update) => {
      setStored((current) => {
        if (current.key !== key) {
          return current
        }
        const value =
          typeof update === 'function' ? update(current.value) : update
        return value === current.value ? current : { key, value }
      })
    },
    [key]
  )

  return { value: stored.key === key ? stored.value : emptyState, onChange }
}
