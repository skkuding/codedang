'use client'

import { Textarea } from '@/components/shadcn/textarea'
import { useTranslate } from '@tolgee/react'
import type { Control, UseFormWatch } from 'react-hook-form'
import { Controller } from 'react-hook-form'

interface QnaFormData {
  title: string
  content: string
  selectedProblem: string
  selectedProblemLabel: string
}

interface ContentProps {
  control: Control<QnaFormData>
  watch: UseFormWatch<QnaFormData>
}

export function Content({ control, watch }: ContentProps) {
  const { t } = useTranslate()
  const watchedValues = watch()
  const contentLength = watchedValues.content?.length || 0

  return (
    <div className="mb-[40px] mt-[10px] flex min-h-[280px] w-full flex-col gap-[10px] rounded-[12px] border border-[#D8D8D8] p-[30px]">
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="content"
            placeholder={t('enter_question_placeholder')}
            className="font-pretendard h-full min-h-[188px] resize-none rounded-none !border-none !p-0 text-base font-normal not-italic leading-normal tracking-[-0.48px] text-[#5C5C5C] shadow-none placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
            maxLength={400}
          />
        )}
      />
      <div className="font-pretendard h-[22px] w-full text-right text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-[#B0B0B0]">
        {`${contentLength}/400`}
      </div>
    </div>
  )
}
