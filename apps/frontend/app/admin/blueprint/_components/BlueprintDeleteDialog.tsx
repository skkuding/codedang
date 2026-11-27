'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { useQueries } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useBlueprintManagementSource } from '../_libs/BlueprintManagementSource'
import {
  isBlueprintDeletionImpact,
  type BlueprintDeletionImpact
} from '../_libs/editTypes'
import { blueprintKeys } from '../_libs/queries'
import type { BlueprintReadState } from '../_libs/types'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

interface BlueprintDeleteDialogProps {
  blueprintId: number
  isExercise: boolean
  targets: readonly { id: number; title: string }[]
  onClose: () => void
}

const impactFields = [
  ['sectionCount', 'Sections with copies'],
  ['assignmentCount', 'Assignments'],
  ['studentCount', 'Students'],
  ['submissionCount', 'Submissions'],
  ['recordedStudentCount', 'Students with learning records'],
  ['qnaCount', 'Q&A'],
  ['noticeCount', 'Notices']
] as const satisfies readonly [keyof BlueprintDeletionImpact, string][]

function permitsDeletion(value: unknown) {
  return (
    isBlueprintDeletionImpact(value) &&
    value.deletable &&
    value.submissionCount === 0 &&
    value.recordedStudentCount === 0
  )
}

function DeletionTarget({
  target,
  state
}: {
  target: { id: number; title: string }
  state: BlueprintReadState<BlueprintDeletionImpact> | null
}) {
  const impact = state?.status === 'success' ? state.data : null
  const complete = isBlueprintDeletionImpact(impact)
  const hasLearningRecords =
    complete && (impact.submissionCount > 0 || impact.recordedStudentCount > 0)
  const canDelete = permitsDeletion(impact)
  const availability = impact?.deletable
    ? 'Deletion impact permits deletion.'
    : 'Deletion is not allowed for this original.'
  return (
    <section
      aria-label={`${target.title} (ID ${target.id})`}
      className="border-line rounded-lg border p-4"
    >
      <h3 className="text-body1_sb_16 break-words">
        {target.title}{' '}
        <span className="text-color-neutral-60 text-sm">#{target.id}</span>
      </h3>
      {!state ? (
        <p role="alert" className="mt-2">
          Deletion impact is not connected.
        </p>
      ) : (
        <BlueprintReadBoundary state={state}>
          {(data) =>
            !isBlueprintDeletionImpact(data) ? (
              <p role="alert" className="mt-2">
                Deletion impact is incomplete. Deletion cannot be confirmed.
              </p>
            ) : (
              <>
                <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-sm">
                  {impactFields.map(([field, label]) => (
                    <div key={field} className="contents">
                      <dt className="break-words">{label}</dt>
                      <dd>{data[field]}</dd>
                    </div>
                  ))}
                </dl>
                <p
                  role={canDelete ? undefined : 'alert'}
                  className="mt-3 text-sm"
                >
                  {hasLearningRecords
                    ? 'Learning records prevent deletion.'
                    : availability}
                </p>
              </>
            )
          }
        </BlueprintReadBoundary>
      )}
    </section>
  )
}

export function BlueprintDeleteDialog({
  blueprintId,
  isExercise,
  targets,
  onClose
}: BlueprintDeleteDialogProps) {
  const source = useBlueprintManagementSource()
  const queries = useQueries({
    queries: targets.map((target) => ({
      queryKey: blueprintKeys.deletionImpact(blueprintId, target.id),
      queryFn: source
        ? () => source.readDeletionImpact(blueprintId, target.id)
        : () =>
            Promise.reject(new Error('Blueprint read adapter is unavailable')),
      enabled: source !== null,
      retry: false,
      staleTime: 0,
      refetchOnMount: 'always' as const
    }))
  })
  const states = queries.map(
    (query): BlueprintReadState<BlueprintDeletionImpact> | null => {
      if (source === null) {
        return null
      }
      if (query.isPending || query.isFetching) {
        return { status: 'loading' }
      }
      if (query.isError) {
        return { status: 'error', onRetry: () => void query.refetch() }
      }
      return query.data
    }
  )
  const [confirmed, setConfirmed] = useState(false)
  const handled = useRef(false)
  const returnFocus = useRef<HTMLElement | null>(null)
  const canConfirm =
    targets.length > 0 &&
    states.every(
      (state) => state?.status === 'success' && permitsDeletion(state.data)
    )
  const kind = isExercise ? 'exercise' : 'assignment'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] flex-col gap-5 overflow-y-auto rounded-2xl p-6 sm:rounded-2xl sm:p-10"
        onOpenAutoFocus={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault()
            returnFocus.current.focus()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Delete {targets.length} {kind}
            {targets.length === 1 ? '' : 's'}?
          </DialogTitle>
          <DialogDescription>
            Check each original and its deletion impact. Deletion effects on
            section copies are not confirmed. No content will be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {targets.map((target, index) => (
            <DeletionTarget
              key={`${blueprintId}:${target.id}`}
              target={target}
              state={states[index] ?? null}
            />
          ))}
          {targets.length === 0 && (
            <p role="alert">Select at least one original.</p>
          )}
        </div>
        <p role="status" className="text-sm">
          {confirmed
            ? 'Blueprint deletion is not connected. No content has been deleted.'
            : 'Deletion is not connected. Confirm does not delete content.'}
        </p>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error hover:bg-red-500/90"
            disabled={!canConfirm || confirmed}
            onClick={() => {
              if (!canConfirm || handled.current) {
                return
              }
              handled.current = true
              setConfirmed(true)
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
