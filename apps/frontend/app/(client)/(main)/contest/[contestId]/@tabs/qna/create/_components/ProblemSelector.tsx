'use client'

import type { QnaFormData } from '@/types/type'
import { ChevronRight } from 'lucide-react'
import type { UseFormWatch } from 'react-hook-form'

interface ProblemSelectorProps {
  watch: UseFormWatch<QnaFormData>
  isLoadingProblems: boolean
  isDropdownOpen: boolean
  onToggleDropdown: () => void
}

export function ProblemSelector({
  watch,
  isLoadingProblems,
  isDropdownOpen,
  onToggleDropdown
}: ProblemSelectorProps) {
  const watchedValues = watch()

  return (
    <div className="flex">
      <div
        className="flex max-w-[94px] cursor-pointer items-center border-r border-[#D8D8D8] bg-white pr-[10px]"
        onClick={() => !isLoadingProblems && onToggleDropdown()}
      >
        <span className="font-pretendard mr-[6px] !w-[54px] overflow-hidden truncate text-base font-medium not-italic leading-[22.4px] tracking-[-0.48px] text-[#5C5C5C]">
          {isLoadingProblems
            ? 'Loading...'
            : watchedValues.selectedProblemLabel}
        </span>
        <ChevronRight
          className={`h-4 w-4 text-[#C4C4C4] ${isDropdownOpen ? 'rotate-90' : ''} transition-transform ${isLoadingProblems ? 'opacity-50' : ''}`}
        />
      </div>
    </div>
  )
}
