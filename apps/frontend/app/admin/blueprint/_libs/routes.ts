import type { Route } from 'next'
import type { BlueprintListScope } from './types'

export type BlueprintContentKind = 'assignment' | 'exercise'

export interface BlueprintListLocation {
  cursor: number | null
  take: number
  page: number
}

export function parseBlueprintId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null
  }
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export function blueprintBaseHref(blueprintId: number): Route {
  return `/admin/blueprint/${blueprintId}` as Route
}

export function blueprintKind(pathname: string): BlueprintContentKind {
  return pathname.split('/')[4] === 'exercise' ? 'exercise' : 'assignment'
}

export function blueprintListLocation(params: {
  get: (name: string) => string | null
}): BlueprintListLocation {
  return {
    cursor: parseBlueprintId(params.get('cursor') ?? ''),
    take: parseBlueprintId(params.get('take') ?? '') ?? 10,
    page: parseBlueprintId(params.get('page') ?? '') ?? 1
  }
}

function listQuery(location?: BlueprintListLocation): string {
  if (!location) {
    return ''
  }
  const query = new URLSearchParams()
  if (location.cursor !== null) {
    query.set('cursor', String(location.cursor))
  }
  if (location.take !== 10) {
    query.set('take', String(location.take))
  }
  if (location.page !== 1) {
    query.set('page', String(location.page))
  }
  return query.size ? `?${query}` : ''
}

export function blueprintListHref(
  blueprintId: number,
  kind: BlueprintContentKind,
  location?: BlueprintListLocation
): Route {
  return `/admin/blueprint/${blueprintId}/${kind}${listQuery(location)}` as Route
}

export function blueprintDetailHref(
  blueprintId: number,
  kind: BlueprintContentKind,
  assignmentId: number,
  location: BlueprintListLocation
): Route {
  return `/admin/blueprint/${blueprintId}/${kind}/${assignmentId}${listQuery(location)}` as Route
}

export function blueprintScope(
  blueprintId: number,
  kind: BlueprintContentKind,
  location: BlueprintListLocation
): BlueprintListScope {
  return {
    blueprintCourseId: blueprintId,
    isExercise: kind === 'exercise',
    cursor: location.cursor,
    take: location.take,
    page: location.page
  }
}
