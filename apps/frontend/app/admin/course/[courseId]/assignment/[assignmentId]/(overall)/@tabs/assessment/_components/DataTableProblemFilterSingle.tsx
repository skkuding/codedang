'use client'

import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { IoChevronDown, IoFilter } from 'react-icons/io5'

export function ProblemSelectDropdown({
  problems,
  selectedProblemId,
  onSelect
}: {
  problems: { problemId: number; title: string; order: number }[]
  selectedProblemId: number | null
  onSelect: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [tempSelected, setTempSelected] = useState<string>(
    selectedProblemId ? String(selectedProblemId) : ''
  )

  useEffect(() => {
    if (selectedProblemId) {
      setTempSelected(String(selectedProblemId))
    }
  }, [selectedProblemId])

  const getSelectedLabel = () => {
    const selectedOption = problems.find(
      (p) => String(p.problemId) === tempSelected
    )
    return selectedOption
      ? String.fromCharCode(65 + selectedOption.order)
      : '...'
  }

  const { t } = useTranslate()

  return (
    <div className="relative">
      <button
        className="shadow-2xs flex h-9 min-w-[180px] items-center gap-2 rounded-full border border-gray-300 bg-white px-4"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <IoFilter className="text-lg text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {t('problem_select_dropdown_button_problem')}
        </span>
        <span className="ml-2 text-xs font-semibold text-gray-500">
          {getSelectedLabel()}
        </span>
        <IoChevronDown
          className={cn(
            'ml-auto text-base text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-2 flex w-60 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
          {problems.map((problem) => (
            <div
              key={problem.problemId}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md px-1 py-1 transition-colors',
                tempSelected === String(problem.problemId)
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-100'
              )}
              onClick={() => {
                setTempSelected(String(problem.problemId))
                onSelect(problem.problemId)
                setOpen(false)
              }}
            >
              <Checkbox
                checked={tempSelected === String(problem.problemId)}
                className="rounded-xs h-4 w-4 border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
              />
              <span
                className={cn(
                  'text-sm',
                  tempSelected === String(problem.problemId)
                    ? 'text-primary font-bold'
                    : 'font-normal text-gray-800'
                )}
              >
                {String.fromCharCode(65 + problem.order)}. {problem.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
