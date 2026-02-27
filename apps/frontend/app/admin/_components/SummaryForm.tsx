'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface SummaryFormProps {
  name: string
}

interface SummarySectionProps {
  formKey: string
  i18nKey: string
  maxChar: number
  disabled?: boolean
  isLast?: boolean
}

export function SummaryForm({ name }: SummaryFormProps) {
  const {
    formState: { errors }
  } = useFormContext()

  return (
    <div className="h-[285px] rounded-xl border border-[#80808040] bg-white">
      <SummarySection formKey="참여대상" i18nKey="target" maxChar={60} />
      <SummarySection formKey="진행방식" i18nKey="format" maxChar={60} />
      <SummarySection
        formKey="순위산정"
        i18nKey="ranking"
        maxChar={60}
        disabled
      />
      <SummarySection formKey="문제형태" i18nKey="problemType" maxChar={120} />
      <SummarySection
        formKey="참여혜택"
        i18nKey="benefits"
        maxChar={120}
        isLast
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}

function SummarySection({
  formKey,
  i18nKey,
  maxChar,
  disabled,
  isLast
}: SummarySectionProps) {
  const { t } = useTranslate()
  const { register, watch, setValue } = useFormContext()

  const [inputCount, setInputCount] = useState(0)
  const fieldPath = `summary.${formKey}`
  const watchedValue = watch(fieldPath)

  useEffect(() => {
    setInputCount(watchedValue?.length || 0)
  }, [watchedValue])

  return (
    <div
      className={cn(
        'flex items-center gap-6 px-4 py-3',
        !isLast && 'border-b border-[#80808040]'
      )}
    >
      <label
        htmlFor={i18nKey}
        className="text-primary border-primary pointer-events-none h-8 w-[100px] rounded-full border py-[6px] text-center text-sm font-semibold"
      >
        {t(`summary_label_${i18nKey}`)}
      </label>
      <Input
        id={i18nKey}
        type="text"
        className={cn(
          'focus:outline-hidden h-8 border-none placeholder:text-sm placeholder:text-[#9B9B9B]',
          disabled &&
            'disabled:bg-none disabled:text-black disabled:opacity-100'
        )}
        maxLength={maxChar}
        disabled={disabled}
        value={disabled ? t('summary_ranking_default') : undefined}
        placeholder={t('summary_section_placeholder', {
          maxChar: maxChar.toString()
        })}
        {...register(fieldPath)}
        onChange={(e) => {
          if (e.target.value.length > maxChar) {
            e.preventDefault()
            return
          }
          setValue(fieldPath, e.target.value)
        }}
      />
      <span className="text-sm text-[#8A8A8A]">
        {!disabled && `${inputCount}/${maxChar}`}
      </span>
    </div>
  )
}
