'use client'

import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import HelpIcon from '@/public/icons/blueprint-create-help.svg'
import { useId } from 'react'
import type {
  BlueprintCreateProblem,
  BlueprintDraftProblem
} from '../_libs/createTypes'

interface BlueprintProblemSolutionsProps {
  problems: readonly BlueprintDraftProblem[]
  problemById: ReadonlyMap<number, BlueprintCreateProblem>
  onChange: (problemId: number, changes: Partial<BlueprintDraftProblem>) => void
  disabled: boolean
  errors?: Readonly<Record<string, string>>
}

export function BlueprintProblemSolutions({
  problems,
  problemById,
  onChange: updateProblem,
  disabled,
  errors
}: BlueprintProblemSolutionsProps) {
  const id = useId()
  const solutionProblems = problems.filter((problem) => {
    const item = problemById.get(problem.problemId)
    return item && (item.hasSolution || problem.solution !== 'hidden')
  })
  return (
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
          const item = problemById.get(problem.problemId)
          const hasSolution = Boolean(item?.hasSolution)
          const title = item?.title ?? `Problem #${problem.problemId}`
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
                            solution: value as BlueprintDraftProblem['solution']
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              )}
              {!hasSolution && (
                <p role="status" className="text-body2_m_14 px-2 text-gray-600">
                  Solution information has changed. Turn off its release setting
                  or remove the problem.
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
  )
}
