'use client'

import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import { SearchInput } from '@/components/shadcn/search-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { Fragment, useEffect, useId, useMemo } from 'react'
import type {
  BlueprintAssignmentSummary,
  BlueprintListScope,
  BlueprintListStateController,
  BlueprintReadState
} from '../_libs/types'
import { useBlueprintAssignmentListState } from '../_libs/useBlueprintAssignmentListState'
import { BlueprintAssignmentSections } from './BlueprintAssignmentSections'
import { BlueprintListPagination } from './BlueprintListPagination'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

interface BlueprintAssignmentListProps {
  scope: BlueprintListScope
  state: BlueprintReadState<readonly BlueprintAssignmentSummary[]>
  viewState?: BlueprintListStateController
  onOpenMaster: (id: number) => void
  pagination: {
    page: number
    hasPrevious: boolean
    hasNext: boolean
    onPrevious: () => void
    onNext: () => void
    onPageSizeChange: (take: number) => void
  }
}

export function BlueprintAssignmentList(props: BlueprintAssignmentListProps) {
  const { scope, state } = props
  const localViewState = useBlueprintAssignmentListState(scope)

  return (
    <BlueprintReadBoundary state={state}>
      {(assignments) => (
        <BlueprintAssignmentListPage
          key={`${scope.blueprintCourseId}:${scope.isExercise}:${scope.cursor}:${scope.take}:${scope.page ?? 1}`}
          {...props}
          viewState={props.viewState ?? localViewState}
          assignments={assignments}
        />
      )}
    </BlueprintReadBoundary>
  )
}

function BlueprintAssignmentListPage({
  scope,
  assignments,
  viewState,
  onOpenMaster,
  pagination
}: BlueprintAssignmentListProps & {
  assignments: readonly BlueprintAssignmentSummary[]
  viewState: BlueprintListStateController
}) {
  const searchId = useId()
  const { value, onChange } = viewState
  const { search } = value
  const selected = new Set(value.selectedIds)
  const expanded = new Set(value.expandedIds)
  const kind = scope.isExercise ? 'exercises' : 'assignments'
  const pageAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) => assignment.isExercise === scope.isExercise
      ),
    [assignments, scope.isExercise]
  )
  useEffect(() => {
    const available = new Set(
      pageAssignments.map((assignment) => assignment.id)
    )
    onChange((current) => {
      const selectedIds = current.selectedIds.filter((id) => available.has(id))
      const expandedIds = current.expandedIds.filter((id) => available.has(id))
      if (
        selectedIds.length === current.selectedIds.length &&
        expandedIds.length === current.expandedIds.length
      ) {
        return current
      }
      return { ...current, selectedIds, expandedIds }
    })
  }, [pageAssignments, onChange])
  const visibleAssignments = pageAssignments.filter((assignment) =>
    assignment.title
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase())
  )
  const selectedCount = pageAssignments.filter((assignment) =>
    selected.has(assignment.id)
  ).length
  const visibleSelectedCount = visibleAssignments.filter((assignment) =>
    selected.has(assignment.id)
  ).length
  const allVisibleSelected =
    visibleAssignments.length > 0 &&
    visibleSelectedCount === visibleAssignments.length

  function toggleId(current: readonly number[], id: number): readonly number[] {
    const next = new Set(current)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    return [...next]
  }

  return (
    <section aria-label={`Blueprint ${kind}`}>
      <div className="relative flex h-[46px] w-full items-center">
        <label htmlFor={searchId} className="sr-only">
          Search this page
        </label>
        <div className="min-w-0 flex-1">
          <SearchInput
            id={searchId}
            value={search}
            onChange={(event) => {
              const search = event.currentTarget.value
              onChange((current) => ({ ...current, search }))
            }}
            placeholder="Search"
            sizeVariant="lg"
            aria-describedby={`${searchId}-scope`}
          />
        </div>
        <p
          id={`${searchId}-scope`}
          className="absolute left-0 top-full mt-1 text-xs text-neutral-600"
        >
          Searches this page only.
        </p>
      </div>

      <div className="mt-[28px]">
        <Table>
          <TableHeader className="border-b-0">
            <TableRow>
              <TableHead scope="col" className="w-[1%] whitespace-nowrap p-0">
                <div className="flex h-[39px] w-14 items-center justify-center">
                  <Checkbox
                    aria-label={`Select all visible ${kind}`}
                    disabled={visibleAssignments.length === 0}
                    checked={
                      allVisibleSelected ||
                      (visibleSelectedCount > 0 && 'indeterminate')
                    }
                    onCheckedChange={(checked) => {
                      onChange((current) => {
                        const next = new Set(current.selectedIds)
                        for (const assignment of visibleAssignments) {
                          if (checked === true) {
                            next.add(assignment.id)
                          } else {
                            next.delete(assignment.id)
                          }
                        }
                        return { ...current, selectedIds: [...next] }
                      })
                    }}
                    className="translate-y-[2px]"
                  />
                </div>
              </TableHead>
              <TableHead scope="col">
                <div className="flex h-[39px] min-w-24 items-center justify-center rounded-full bg-neutral-200/30 text-base font-normal text-[#8A8A8A]">
                  Week
                </div>
              </TableHead>
              <TableHead scope="col">
                <div className="flex h-[39px] min-w-[400px] items-center justify-center rounded-full bg-neutral-200/30 text-base font-normal text-[#8A8A8A]">
                  Title
                </div>
              </TableHead>
              <TableHead scope="col">
                <div className="flex h-[39px] min-w-[116px] items-center justify-center rounded-full bg-neutral-200/30 text-base font-normal text-[#8A8A8A]">
                  Sections
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:border-[#80808040]">
            {visibleAssignments.map((assignment) => {
              const isExpanded = expanded.has(assignment.id)
              const sectionsId = `${searchId}-sections-${assignment.id}`
              return (
                <Fragment key={assignment.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-neutral-200/30"
                    onClick={() => onOpenMaster(assignment.id)}
                    data-state={
                      selected.has(assignment.id) ? 'selected' : undefined
                    }
                  >
                    <TableCell
                      className="h-[57px]! w-[1%] whitespace-nowrap p-0 text-sm font-normal"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex w-14 justify-center">
                        <Checkbox
                          aria-label={`Select ${assignment.title}`}
                          checked={selected.has(assignment.id)}
                          onCheckedChange={() =>
                            onChange((current) => ({
                              ...current,
                              selectedIds: toggleId(
                                current.selectedIds,
                                assignment.id
                              )
                            }))
                          }
                          className="translate-y-[2px]"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="h-[57px]! p-4 text-center text-sm font-normal md:p-4">
                      <span className="whitespace-nowrap">
                        Week {assignment.week}
                      </span>
                    </TableCell>
                    <TableCell className="h-[57px]! p-4 text-sm font-normal md:p-4">
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto justify-start whitespace-normal p-0 text-left text-sm font-normal text-inherit"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenMaster(assignment.id)
                        }}
                      >
                        {assignment.title}
                      </Button>
                    </TableCell>
                    <TableCell className="h-[57px]! px-4 py-2 text-center text-sm font-normal md:p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-3 py-0 text-sm font-normal"
                        aria-label={`Sections for ${assignment.title}`}
                        aria-expanded={isExpanded}
                        aria-controls={isExpanded ? sectionsId : undefined}
                        onClick={(event) => {
                          event.stopPropagation()
                          onChange((current) => ({
                            ...current,
                            expandedIds: toggleId(
                              current.expandedIds,
                              assignment.id
                            )
                          }))
                        }}
                      >
                        {assignment.assignment === null
                          ? 'Unavailable'
                          : assignment.assignment.length}
                        <span aria-hidden="true" className="ml-2">
                          {isExpanded ? '▴' : '▾'}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow id={sectionsId}>
                      <TableCell colSpan={4}>
                        <BlueprintAssignmentSections
                          copies={assignment.assignment}
                          isExercise={scope.isExercise}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
            {visibleAssignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {pageAssignments.length === 0
                    ? `No ${kind} on this page.`
                    : `No ${kind} match this page's search.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-[40px]">
        <BlueprintListPagination
          {...pagination}
          pageSize={scope.take}
          selectedCount={selectedCount}
          currentPageCount={pageAssignments.length}
          kind={kind}
        />
      </div>
    </section>
  )
}
