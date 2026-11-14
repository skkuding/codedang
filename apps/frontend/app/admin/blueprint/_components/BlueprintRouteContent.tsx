'use client'

import { Button } from '@/components/shadcn/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { blueprintKeys } from '../_libs/queries'
import { blueprintDetailHref, blueprintListHref } from '../_libs/routes'
import { useBlueprintRead } from '../_libs/useBlueprintRead'
import { BlueprintAssignmentDetail } from './BlueprintAssignmentDetail'
import { BlueprintAssignmentList } from './BlueprintAssignmentList'
import { useBlueprintDataSource } from './BlueprintDataSourceProvider'
import { useBlueprintWorkspace } from './BlueprintWorkspace'

function BlueprintUnavailable() {
  return <p role="status">Blueprint content is currently unavailable.</p>
}

export function BlueprintListRoute() {
  const { blueprintId, kind, scope, location, viewState } =
    useBlueprintWorkspace()
  const source = useBlueprintDataSource()
  const state = useBlueprintRead(
    blueprintKeys.assignments(scope),
    source ? () => source.readAssignments(scope) : null
  )
  const router = useRouter()
  if (state === null) {
    return <BlueprintUnavailable />
  }
  const page = state.status === 'success' ? state.data : null
  return (
    <BlueprintAssignmentList
      scope={scope}
      state={
        state.status === 'success'
          ? { status: 'success', data: state.data.items }
          : state
      }
      viewState={viewState}
      onOpenMaster={(id) =>
        router.push(blueprintDetailHref(blueprintId, kind, id, location))
      }
      pagination={{
        page: location.page,
        hasPrevious: page?.previousCursor !== undefined,
        hasNext: page !== null && page.nextCursor !== null,
        onPrevious: () => {
          if (page?.previousCursor !== undefined) {
            router.push(
              blueprintListHref(blueprintId, kind, {
                ...location,
                cursor: page.previousCursor,
                page: Math.max(1, location.page - 1)
              })
            )
          }
        },
        onNext: () => {
          if (page !== null && page.nextCursor !== null) {
            router.push(
              blueprintListHref(blueprintId, kind, {
                ...location,
                cursor: page.nextCursor,
                page: location.page + 1
              })
            )
          }
        },
        onPageSizeChange: (take) => {
          router.push(
            blueprintListHref(blueprintId, kind, {
              cursor: null,
              take,
              page: 1
            })
          )
        }
      }}
    />
  )
}

export function BlueprintDetailRoute({
  assignmentId
}: {
  assignmentId: number
}) {
  const { blueprintId, kind, location } = useBlueprintWorkspace()
  const source = useBlueprintDataSource()
  const state = useBlueprintRead(
    blueprintKeys.assignment(blueprintId, assignmentId),
    source ? () => source.readAssignment(blueprintId, assignmentId) : null
  )
  const router = useRouter()
  if (state === null) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="outline" className="self-start" asChild>
          <Link href={blueprintListHref(blueprintId, kind, location)}>
            Back to {kind === 'exercise' ? 'Exercises' : 'Assignments'}
          </Link>
        </Button>
        <BlueprintUnavailable />
      </div>
    )
  }
  return (
    <BlueprintAssignmentDetail
      state={state}
      isExercise={kind === 'exercise'}
      onBack={() => router.push(blueprintListHref(blueprintId, kind, location))}
    />
  )
}
