'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import { Input } from '@/components/shadcn/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { convertToLetter } from '@/libs/utils'
import { useId, useState } from 'react'
import type {
  BlueprintCreateDraft,
  BlueprintDraftProblem
} from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import { BlueprintProblemLevel } from './BlueprintProblemLevel'
import { BlueprintProblemSelector } from './BlueprintProblemSelector'
import { BlueprintProblemSolutions } from './BlueprintProblemSolutions'

interface BlueprintCreateProblemsProps {
  draft: BlueprintCreateDraft
  onChange: (draft: BlueprintCreateDraft) => void
  isExercise: boolean
  disabled?: boolean
  errors?: Readonly<Record<string, string>>
  problemCatalog: BlueprintProblemCatalogController
  problemChangesAllowed?: boolean
}

export function BlueprintCreateProblems({
  draft,
  onChange,
  isExercise,
  disabled = false,
  errors,
  problemCatalog,
  problemChangesAllowed = true
}: BlueprintCreateProblemsProps) {
  const id = useId()
  const [selected, setSelected] = useState<readonly number[]>([])
  const compositionDisabled = disabled || !problemChangesAllowed
  const error = errors?.problems
  const problemById = new Map(
    problemCatalog.problems.map((problem) => [problem.id, problem])
  )
  const selectedIds = selected.filter((problemId) =>
    draft.problems.some((problem) => problem.problemId === problemId)
  )

  function updateProblem(
    problemId: number,
    changes: Partial<BlueprintDraftProblem>
  ) {
    if (!problemChangesAllowed && 'score' in changes) {
      return
    }
    onChange({
      ...draft,
      problems: draft.problems.map((problem) =>
        problem.problemId === problemId ? { ...problem, ...changes } : problem
      )
    })
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
                disabled={compositionDisabled}
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
            <BlueprintProblemSelector
              problems={draft.problems}
              problemCatalog={problemCatalog}
              disabled={disabled}
              compositionDisabled={compositionDisabled}
              onApply={(problems) => {
                onChange({ ...draft, problems })
                setSelected([])
              }}
            />
          </div>
        </div>
        {!problemChangesAllowed && (
          <p role="status" className="text-body2_m_14 mb-3 text-gray-600">
            Adding or removing problems and changing scores is locked until
            learning-record permission is confirmed.
          </p>
        )}
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
                  disabled={compositionDisabled || draft.problems.length === 0}
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
                      disabled={compositionDisabled}
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
                        disabled={compositionDisabled}
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
                    <BlueprintProblemLevel level={item?.level} />
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

      <BlueprintProblemSolutions
        problems={draft.problems}
        problemById={problemById}
        onChange={updateProblem}
        disabled={disabled}
        errors={errors}
      />
    </div>
  )
}
