'use client'

import { Card, CardContent } from '@/components/shadcn/card'
import type { ProblemOption, QnaFormData } from '@/types/type'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'

interface ProblemDropdownProps {
  watch: UseFormWatch<QnaFormData>
  setValue: UseFormSetValue<QnaFormData>
  problemOptions: ProblemOption[]
  isOpen: boolean
  onClose: () => void
}

export function ProblemDropdown({
  watch,
  setValue,
  problemOptions,
  isOpen,
  onClose
}: ProblemDropdownProps) {
  const watchedValues = watch()

  const handleProblemSelect = (value: string, label: string) => {
    setValue('selectedProblem', value, { shouldValidate: true })
    setValue('selectedProblemLabel', label, { shouldValidate: true })
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <Card className="mt-[10px] w-full">
      <CardContent className="flex flex-col gap-3 rounded-[12px] p-5">
        {problemOptions.map((option) => (
          <div
            key={option.value}
            className="flex cursor-pointer items-center space-x-[14px] rounded p-1 hover:bg-gray-50"
            onClick={() => handleProblemSelect(option.value, option.label)}
          >
            <input
              type="radio"
              name="problem-select"
              value={option.value}
              checked={watchedValues.selectedProblem === option.value}
              onChange={() => {}}
              className="accent-primary h-5 w-5"
            />
            <label
              className={`font-pretendard cursor-pointer truncate text-sm font-normal not-italic leading-normal tracking-[-0.42px] ${
                watchedValues.selectedProblem === option.value
                  ? 'text-primary'
                  : 'text-black'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
