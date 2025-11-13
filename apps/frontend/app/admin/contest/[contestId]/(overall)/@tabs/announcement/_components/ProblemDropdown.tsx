'use client'

import { Card, CardContent } from '@/components/shadcn/card'
import type { CreateAnnouncementInput } from '@generated/graphql'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ScrollArea } from './DropDownScrollBar'

interface ProblemOption {
  order: number
  title: string
  label: string
}

interface ProblemDropdownProps {
  watch: UseFormWatch<CreateAnnouncementInput>
  setValue: UseFormSetValue<CreateAnnouncementInput>
  problemOptions: ProblemOption[]
  isOpen: boolean
  onClose: () => void
  isContestStarted: boolean
}

export function ProblemDropdown({
  watch,
  setValue,
  problemOptions,
  isOpen,
  onClose,
  isContestStarted
}: ProblemDropdownProps) {
  const selectedProblemOrder = watch('problemOrder')

  const handleProblemSelect = (order: number | undefined) => {
    setValue('problemOrder', order, { shouldValidate: true })
    onClose()
  }

  const generalOption = {
    order: undefined,
    label: 'General'
  }

  if (!isOpen) {
    return null
  }

  const displayOptions = (() => {
    if (isContestStarted) {
      return [generalOption, ...problemOptions]
    } else {
      return [generalOption]
    }
  })()

  return (
    <Card className="w-full shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]">
      <CardContent className="!p-0">
        <ScrollArea className="border-line self-strech flex max-h-[208px] min-h-[36px] flex-col overflow-y-scroll rounded-[12px] border bg-white px-5 py-5">
          <div className="flex flex-col space-y-3">
            {displayOptions.map((option) => (
              <div
                key={option.order ?? 'general'}
                className="flex h-full items-center space-x-[14px]"
                onClick={() => handleProblemSelect(option.order)}
              >
                <input
                  type="radio"
                  name="problem-select"
                  value={option.order ?? ''}
                  checked={selectedProblemOrder === option.order}
                  onChange={() => {}}
                  className="accent-primary h-5 w-5"
                />
                <label
                  className={`text-base font-normal leading-[24px] tracking-[-0.48px] ${
                    selectedProblemOrder === option.order
                      ? 'text-primary'
                      : 'text-black'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
