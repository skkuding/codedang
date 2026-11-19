'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { PROBLEM_IMPORT_LIMIT } from '@/app/admin/blueprint/_libs/problemImport'
import { Badge } from '@/components/shadcn/badge'
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
import { Switch } from '@/components/shadcn/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { convertToLetter } from '@/libs/utils'
import EditIcon from '@/public/icons/blueprint-create-edit.svg'
import HelpIcon from '@/public/icons/blueprint-create-help.svg'
import type { Level } from '@/types/type'
import { useId, useRef, useState } from 'react'
import type {
  BlueprintCreateDraft,
  BlueprintDraftProblem
} from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'

interface BlueprintCreateProblemsProps {
  draft: BlueprintCreateDraft
  onChange: (draft: BlueprintCreateDraft) => void
  isExercise: boolean
  disabled?: boolean
  errors?: Readonly<Record<string, string>>
  problemCatalog: BlueprintProblemCatalogController
}

const catalogMessages: Partial<
  Record<BlueprintProblemCatalogController['status'], string>
> = {
  error: 'Could not load problems. Your selection has been kept.',
  unauthenticated: 'Sign in again, then retry loading problems.',
  forbidden: 'You do not have permission to load these problems.'
}

function ProblemLevel({ level }: { level: string | undefined }) {
  if (!level) {
    return <span>-</span>
  }
  return (
    <Badge
      variant={/^Level[1-5]$/.test(level) ? (level as Level) : 'outline'}
      className="justify-center whitespace-nowrap"
    >
      {/^Level[1-5]$/.test(level) ? `Level ${level.slice(-1)}` : level}
    </Badge>
  )
}

export function BlueprintCreateProblems({
  draft,
  onChange,
  isExercise,
  disabled = false,
  errors,
  problemCatalog
}: BlueprintCreateProblemsProps) {
  const id = useId()
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<readonly number[]>([])
  const [selected, setSelected] = useState<readonly number[]>([])
  const catalogue = problemCatalog.problems
  const catalogReady =
    problemCatalog.status === 'ready' && !problemCatalog.isLoadingMore
  const catalogError = catalogMessages[problemCatalog.status]
  const error = errors?.problems
  const problemById = new Map(catalogue.map((problem) => [problem.id, problem]))
  const unresolvedIds = pending.filter(
    (problemId) => !problemById.has(problemId)
  )
  const canApply =
    !disabled &&
    catalogReady &&
    pending.length <= PROBLEM_IMPORT_LIMIT &&
    unresolvedIds.length === 0
  const solutionProblems = draft.problems.filter(
    (problem) =>
      problemById.has(problem.problemId) &&
      (problemById.get(problem.problemId)?.hasSolution ||
        problem.solution !== 'hidden')
  )
  const visibleProblems = catalogue.filter((problem) =>
    `${problem.id} ${problem.title}`.toLowerCase().includes(query.toLowerCase())
  )
  const selectedIds = selected.filter((problemId) =>
    draft.problems.some((problem) => problem.problemId === problemId)
  )

  function updateProblem(
    problemId: number,
    changes: Partial<BlueprintDraftProblem>
  ) {
    onChange({
      ...draft,
      problems: draft.problems.map((problem) =>
        problem.problemId === problemId ? { ...problem, ...changes } : problem
      )
    })
  }

  function changeDialog(nextOpen: boolean) {
    if (nextOpen) {
      setPending(draft.problems.map((problem) => problem.problemId))
      setQuery('')
    }
    setOpen(nextOpen)
  }

  function applyProblems() {
    if (!canApply) {
      return
    }
    const retained = draft.problems.filter((problem) =>
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
    onChange({ ...draft, problems: [...retained, ...added] })
    setSelected([])
    setOpen(false)
  }

  function moveProblem(from: number, to: number) {
    const problems = [...draft.problems]
    const [problem] = problems.splice(from, 1)
    problems.splice(to, 0, problem)
    onChange({ ...draft, problems })
  }

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <section className="min-w-0" aria-labelledby={`${id}-problems`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id={`${id}-problems`}
              className="text-sub2_m_18 tracking-[-0.54px]"
            >
              Problem List
            </h2>
            <p className="text-body2_m_14 tracking-[-0.42px] text-[#9B9B9B]">
              You can add or remove problems using Edit Problem.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  onChange({
                    ...draft,
                    problems: draft.problems.filter(
                      (problem) => !selectedIds.includes(problem.problemId)
                    )
                  })
                  setSelected([])
                }}
              >
                Remove selected
              </Button>
            )}
            <Button
              ref={editButtonRef}
              type="button"
              className="text-sub4_sb_14 h-[38px] gap-1 rounded-lg px-[10px] py-2"
              disabled={disabled}
              onClick={() => changeDialog(true)}
            >
              <EditIcon className="shrink-0" aria-hidden="true" />
              Edit Problem
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-body2_m_14 mb-3 text-red-500">
            {error}
          </p>
        )}
        <Table aria-label="Selected problems" className="min-w-[700px]">
          <TableHeader className="border-b-0">
            <TableRow>
              <TableHead scope="col" className="w-14 p-0">
                <Checkbox
                  aria-label="Select all added problems"
                  disabled={disabled || draft.problems.length === 0}
                  checked={
                    (draft.problems.length > 0 &&
                      selectedIds.length === draft.problems.length) ||
                    (selectedIds.length > 0 && 'indeterminate')
                  }
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked === true
                        ? draft.problems.map((problem) => problem.problemId)
                        : []
                    )
                  }
                />
              </TableHead>
              {(isExercise
                ? ['Title', 'Order', 'Level', 'Included']
                : ['Title', 'Score', 'Order', 'Level', 'Included']
              ).map((heading) => (
                <TableHead key={heading} scope="col">
                  <div className="flex h-[39px] items-center justify-center rounded-full bg-neutral-200/30 px-3 text-base font-normal text-[#8A8A8A]">
                    {heading}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {draft.problems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isExercise ? 5 : 6}
                  className="h-20 text-center text-gray-500"
                >
                  No problems added.
                </TableCell>
              </TableRow>
            )}
            {draft.problems.map((problem, index) => {
              const item = problemById.get(problem.problemId)
              const title = item?.title ?? `Problem #${problem.problemId}`
              return (
                <TableRow key={problem.problemId}>
                  <TableCell className="h-[57px] w-14 p-0 text-center md:p-0">
                    <Checkbox
                      aria-label={`Select added problem ${title}`}
                      disabled={disabled}
                      checked={selectedIds.includes(problem.problemId)}
                      onCheckedChange={(checked) =>
                        setSelected((current) =>
                          checked === true
                            ? [...current, problem.problemId]
                            : current.filter(
                                (value) => value !== problem.problemId
                              )
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="h-[57px] min-w-[260px] max-w-[400px] px-0 py-[18px] md:py-[18px]">
                    <span className="line-clamp-2 break-words" title={title}>
                      {title}
                    </span>
                  </TableCell>
                  {!isExercise && (
                    <TableCell className="w-[86px] px-2 py-3 md:py-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        aria-label={`Score for ${title}`}
                        min={0}
                        step={1}
                        value={
                          Number.isFinite(problem.score) ? problem.score : ''
                        }
                        disabled={disabled}
                        className="h-[38px] rounded-full px-3 text-center"
                        onChange={(event) =>
                          updateProblem(problem.problemId, {
                            score: event.currentTarget.valueAsNumber
                          })
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="w-[86px] px-2 py-3 md:py-3">
                    <OptionSelect
                      value={String(index)}
                      disabled={disabled}
                      onChange={(value) => moveProblem(index, Number(value))}
                      options={draft.problems.map((_, order) => ({
                        value: String(order),
                        label: convertToLetter(order)
                      }))}
                      triggerProps={{ 'aria-label': `Order for ${title}` }}
                      className="h-[38px] w-[70px] rounded-full px-4"
                    />
                  </TableCell>
                  <TableCell className="w-[110px] px-5 py-3 text-center md:py-3">
                    <ProblemLevel level={item?.level} />
                  </TableCell>
                  <TableCell className="w-[91px] px-5 py-3 text-center md:py-3">
                    <span title="Usage information is not connected">-</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {!isExercise && draft.problems.length > 0 && (
          <p className="text-body2_m_14 mt-3 text-right">
            Score Sum:{' '}
            <span className="text-primary font-semibold">
              {draft.problems.reduce(
                (sum, problem) =>
                  sum + (Number.isFinite(problem.score) ? problem.score : 0),
                0
              )}
            </span>
          </p>
        )}
      </section>

      <section aria-labelledby={`${id}-solutions`}>
        <div className="mb-3">
          <h2
            id={`${id}-solutions`}
            className="text-sub2_m_18 flex items-center gap-0.5 tracking-[-0.54px]"
          >
            Solution
            <HelpIcon className="shrink-0" aria-hidden="true" />
          </h2>
          <p className="text-body2_m_14 tracking-[-0.42px] text-[#9B9B9B]">
            Only problems with solutions are listed below.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3">
          {solutionProblems.length === 0 && (
            <p className="text-body2_m_14 py-4 text-gray-500">
              No added problems with solutions.
            </p>
          )}
          {solutionProblems.map((problem) => {
            const hasSolution = Boolean(
              problemById.get(problem.problemId)?.hasSolution
            )
            const title =
              problemById.get(problem.problemId)?.title ??
              `Problem #${problem.problemId}`
            const manualTimeId = `${id}-manual-${problem.problemId}`
            const manualTimeError =
              errors?.[`problems.${problem.problemId}.manualReleaseTime`]
            return (
              <div key={problem.problemId} className="flex flex-col gap-1 pb-3">
                <div className="flex min-h-14 items-center justify-between gap-4 px-2">
                  <p className="text-body2_m_14 min-w-0 break-words">{title}</p>
                  <Switch
                    aria-label={`Reveal solution for ${title}`}
                    disabled={disabled}
                    checked={problem.solution !== 'hidden'}
                    onCheckedChange={(checked) =>
                      updateProblem(problem.problemId, {
                        solution: checked
                          ? (problem.lastVisibleSolution ?? 'after-due')
                          : 'hidden',
                        ...(!checked && problem.solution !== 'hidden'
                          ? { lastVisibleSolution: problem.solution }
                          : {})
                      })
                    }
                    className="h-6 w-[46px]"
                    thumbClassName="h-5 w-5 data-[state=checked]:translate-x-[22px]"
                  />
                </div>
                {problem.solution !== 'hidden' && (
                  <fieldset
                    aria-label={`Solution release for ${title}`}
                    disabled={disabled || !hasSolution}
                    className="text-body2_m_14 flex flex-wrap items-center gap-5 rounded-full bg-neutral-200/30 px-6 py-[11px] sm:px-[52px]"
                  >
                    {[
                      ['after-due', 'After Due Date'],
                      ['manual', 'Manually']
                    ].map(([value, label]) => (
                      <label key={value} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`${id}-solution-${problem.problemId}`}
                          value={value}
                          className="accent-primary h-[18px] w-[18px]"
                          checked={problem.solution === value}
                          onChange={() =>
                            updateProblem(problem.problemId, {
                              solution:
                                value as BlueprintDraftProblem['solution']
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                )}
                {!hasSolution && (
                  <p
                    role="status"
                    className="text-body2_m_14 px-2 text-gray-600"
                  >
                    Solution information has changed. Turn off its release
                    setting or remove the problem.
                  </p>
                )}
                {problem.solution === 'manual' && (
                  <div className="flex flex-col gap-2 px-2">
                    <label htmlFor={manualTimeId} className="text-body2_m_14">
                      Manual solution release for {title} (Asia/Seoul)
                    </label>
                    <Input
                      id={manualTimeId}
                      type="datetime-local"
                      step={60}
                      value={problem.manualReleaseTime ?? ''}
                      disabled={disabled || !hasSolution}
                      required
                      isError={Boolean(manualTimeError)}
                      aria-describedby={
                        manualTimeError ? `${manualTimeId}-error` : undefined
                      }
                      onChange={(event) =>
                        updateProblem(problem.problemId, {
                          manualReleaseTime: event.currentTarget.value
                        })
                      }
                      className="max-w-[360px]"
                    />
                    {manualTimeError && (
                      <p
                        id={`${manualTimeId}-error`}
                        className="text-error text-sm"
                      >
                        {manualTimeError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

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
            disabled={disabled}
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
                    disabled={disabled}
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
                    disabled ||
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
                <ProblemLevel level={problem.level} />
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
    </div>
  )
}
