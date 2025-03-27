'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface SummaryFormProps {
  name: string
}

interface SummarySectionProps {
  buttonName: string
  maxChar: string
}

export function SummaryForm({ name }: SummaryFormProps) {
  const {
    formState: { errors }
  } = useFormContext()

  return (
    <div className="h-[285px] rounded-xl border border-[#80808040] bg-white">
      <SummarySection buttonName="참여조건" maxChar="60" />
      <SummarySection buttonName="진행방식" maxChar="60" />
      <SummarySection buttonName="순위산정" maxChar="60" />
      <SummarySection buttonName="문제형태" maxChar="120" />
      <SummarySection buttonName="참여혜택" maxChar="120" />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}

function SummarySection({ buttonName, maxChar }: SummarySectionProps) {
  const { register } = useFormContext()

  const [inputCount, setInputCount] = useState(0)

  const onInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCount(e.target.value.length)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-6 px-4 py-3',
        buttonName !== '참여혜택' && 'border-b border-[#80808040]'
      )}
    >
      <label
        htmlFor={buttonName}
        className="text-primary border-primary pointer-events-none h-8 w-[100px] rounded-full border py-[6px] text-center text-sm font-semibold"
      >
        {`${buttonName.slice(0, 2)} ${buttonName.slice(2)}`}
      </label>
      <Input
        id={buttonName}
        type="text"
        className={cn(
          'h-8 border-none placeholder:text-sm placeholder:text-[#9B9B9B] focus:outline-none',
          buttonName === '순위산정' &&
            'disabled:bg-none disabled:text-black disabled:opacity-100'
        )}
        disabled={buttonName === '순위산정'}
        value={
          buttonName === '순위산정' ? 'ICPC 대회 방식을 차용합니다.' : undefined
        }
        placeholder={`Up to ${maxChar} characters including spaces`}
        {...register(`summary.${buttonName}`)}
        onChange={onInputHandler}
      />
      <span className="text-sm text-[#8A8A8A]">
        {buttonName !== '순위산정' && `${inputCount}/${maxChar}`}
      </span>
    </div>
  )
}
