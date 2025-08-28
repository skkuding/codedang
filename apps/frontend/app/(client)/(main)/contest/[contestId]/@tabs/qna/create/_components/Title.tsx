'use client'

import { Textarea } from '@/components/shadcn/textarea'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'

interface QnaFormData {
  title: string
  content: string
  selectedProblem: string
  selectedProblemLabel: string
}

interface TitleInputProps {
  control: Control<QnaFormData>
}

export function Title({ control }: TitleInputProps) {
  return (
    <div className="flex w-full !p-0">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="title"
            placeholder="Enter a question title"
            className="font-pretendard h-[24px] min-h-[24px] resize-none truncate rounded-none border-none p-0 text-base font-normal leading-[22px] tracking-[-0.48px] text-[#5C5C5C] shadow-none ring-0 placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
            maxLength={35}
            rows={1}
          />
        )}
      />
    </div>
  )
}
