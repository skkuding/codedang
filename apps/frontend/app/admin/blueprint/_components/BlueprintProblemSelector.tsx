'use client'

import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import EditIcon from '@/public/icons/blueprint-create-edit.svg'
import { useRef, useState } from 'react'
import type { BlueprintDraftProblem } from '../_libs/createTypes'
import { PROBLEM_IMPORT_LIMIT } from '../_libs/problemImport'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import { BlueprintProblemLevel } from './BlueprintProblemLevel'

interface BlueprintProblemSelectorProps {
  problems: readonly BlueprintDraftProblem[]
  onApply: (problems: readonly BlueprintDraftProblem[]) => void
  problemCatalog: BlueprintProblemCatalogController
  disabled: boolean
  compositionDisabled: boolean
}

const catalogMessages: Partial<
  Record<BlueprintProblemCatalogController['status'], string>
> = {
  error: 'Could not load problems. Your selection has been kept.',
  unauthenticated: 'Sign in again, then retry loading problems.',
  forbidden: 'You do not have permission to load these problems.'
}

export function BlueprintProblemSelector({
  problems,
  onApply,
  problemCatalog,
  disabled,
  compositionDisabled
}: BlueprintProblemSelectorProps) {
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<readonly number[]>([])
  const catalogue = problemCatalog.problems
  const catalogReady =
    problemCatalog.status === 'ready' && !problemCatalog.isLoadingMore
  const catalogError = catalogMessages[problemCatalog.status]
  const problemIds = new Set(catalogue.map((problem) => problem.id))
  const unresolvedIds = pending.filter(
    (problemId) => !problemIds.has(problemId)
  )
  const canApply =
    !compositionDisabled &&
    catalogReady &&
    pending.length <= PROBLEM_IMPORT_LIMIT &&
    unresolvedIds.length === 0
  const visibleProblems = catalogue.filter((problem) =>
    `${problem.id} ${problem.title}`.toLowerCase().includes(query.toLowerCase())
  )
  function changeDialog(nextOpen: boolean) {
    if (nextOpen && compositionDisabled) {
      return
    }
    if (nextOpen) {
      setPending(problems.map((problem) => problem.problemId))
      setQuery('')
    }
    setOpen(nextOpen)
  }

  function applyProblems() {
    if (!canApply) {
      return
    }
    const retained = problems.filter((problem) =>
      pending.includes(problem.problemId)
    )
    const added = catalogue
      .filter(
        (problem) =>
          pending.includes(problem.id) &&
          !retained.some((current) => current.problemId === problem.id)
      )
      .map(
        (problem): BlueprintDraftProblem => ({
          problemId: problem.id,
          score: 0,
          solution: 'hidden'
        })
      )
    onApply([...retained, ...added])
    setOpen(false)
  }

  return (
    <>
      <Button
        ref={editButtonRef}
        type="button"
        className="text-sub4_sb_14 h-[38px] gap-1 rounded-lg px-[10px] py-2"
        disabled={compositionDisabled}
        onClick={() => changeDialog(true)}
      >
        <EditIcon className="shrink-0" aria-hidden="true" />
        Edit Problem
      </Button>
      <Dialog open={open} onOpenChange={changeDialog}>
        <DialogContent
          className="max-h-[85vh] w-[calc(100%-32px)] max-w-[760px] overflow-y-auto rounded-2xl"
          onCloseAutoFocus={(event) => {
            const trigger = editButtonRef.current
            if (trigger?.isConnected && !trigger.disabled) {
              event.preventDefault()
              trigger.focus()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>
              Select the problems to include. Changes apply when you press
              Apply.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="search"
            aria-label="Search loaded problems"
            placeholder="Search loaded problems"
            value={query}
            disabled={compositionDisabled}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <p className="text-body2_m_14 text-color-neutral-60">
            Search applies to loaded problems. {pending.length} selected.
          </p>
          <p className="text-body2_m_14 text-color-neutral-60">
            Select up to {PROBLEM_IMPORT_LIMIT} problems.
          </p>
          {problemCatalog.status === 'loading' && (
            <p role="status">Loading problems...</p>
          )}
          {catalogError && (
            <div className="flex flex-wrap items-center gap-3">
              <p role="alert" className="text-error text-sm">
                {catalogError}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={problemCatalog.retry}
              >
                Retry loading problems
              </Button>
            </div>
          )}
          {unresolvedIds.length > 0 && (
            <div className="flex flex-col gap-2">
              <p role="status" className="text-body2_m_14 text-gray-600">
                Some selected problem information is not loaded. Load more or
                remove these selections before applying.
              </p>
              {unresolvedIds.map((problemId) => (
                <div
                  key={problemId}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-body2_m_14">Problem #{problemId}</span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={compositionDisabled}
                    onClick={() =>
                      setPending((current) =>
                        current.filter((value) => value !== problemId)
                      )
                    }
                  >
                    Remove selection #{problemId}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="max-h-[45vh] overflow-y-auto">
            {catalogReady && catalogue.length === 0 && (
              <p>No available problems.</p>
            )}
            {catalogue.length > 0 && visibleProblems?.length === 0 && (
              <p>No matching problems.</p>
            )}
            {visibleProblems.map((problem) => (
              <label
                key={problem.id}
                className="text-body2_m_14 flex cursor-pointer items-center gap-3 border-b border-gray-200 px-2 py-4"
              >
                <Checkbox
                  aria-label={`Include ${problem.title}`}
                  checked={pending.includes(problem.id)}
                  disabled={
                    compositionDisabled ||
                    !catalogReady ||
                    (!pending.includes(problem.id) &&
                      pending.length >= PROBLEM_IMPORT_LIMIT)
                  }
                  onCheckedChange={(checked) =>
                    setPending((current) =>
                      checked === true
                        ? [...current, problem.id]
                        : current.filter((value) => value !== problem.id)
                    )
                  }
                />
                <span className="min-w-0 flex-1 break-words">
                  {problem.title}
                </span>
                <BlueprintProblemLevel level={problem.level} />
              </label>
            ))}
          </div>
          {problemCatalog.hasMore && (
            <Button
              type="button"
              variant="outline"
              className="justify-self-start"
              disabled={disabled || !catalogReady}
              onClick={problemCatalog.loadMore}
            >
              {problemCatalog.isLoadingMore
                ? 'Loading more problems...'
                : 'Load more problems'}
            </Button>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={applyProblems} disabled={!canApply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
