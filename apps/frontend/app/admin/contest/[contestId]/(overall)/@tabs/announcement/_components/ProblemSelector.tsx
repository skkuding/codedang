'use client'

import arrowBottomIcon from '@/public/icons/arrow-bottom.svg'
import type { CreateAnnouncementInput } from '@generated/graphql'
import Image from 'next/image'
import type { UseFormWatch } from 'react-hook-form'

interface ProblemOption {
  order: number
  title: string
  label: string
}
interface ProblemSelectorProps {
  watch: UseFormWatch<CreateAnnouncementInput>
  problemOptions: ProblemOption[]
  isDropdownOpen: boolean
  onToggleDropdown: () => void
}

export function ProblemSelector({
  watch,
  problemOptions,
  onToggleDropdown
}: ProblemSelectorProps) {
  const selectedProblemOrder = watch('problemOrder')

  const selectedProblem =
    selectedProblemOrder !== undefined
      ? problemOptions.find((option) => option.order === selectedProblemOrder)
      : undefined

  return (
    <button
      type="button"
      onClick={onToggleDropdown}
      className="border-line flex h-[46px] w-full items-center justify-between gap-[14px] rounded-[1000px] border bg-white py-3 pl-6 pr-5 text-left"
    >
      <span className="text-color-neutral-40 text-base font-medium leading-[22.4px] tracking-[-0.48px]">
        {selectedProblem
          ? `${selectedProblem.order + 1}. ${selectedProblem.label}`
          : 'General'}
      </span>
      <Image src={arrowBottomIcon} alt="arrowbottom" width={18} />
    </button>
  )
}
