'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../_libs/utils'
import { ErrorMessage } from './ErrorMessage'

interface TitleFormProps {
  placeholder: string
}

export function TitleForm({ placeholder }: TitleFormProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()
  // NOTE: Contest Title Form은 최대 길이 120 (Assignment 쪽도 피그마상 120으로 확인해서 우선 120으로 설정)
  const [inputCount, setInputCount] = useState(0)

  useEffect(() => {
    const subscription = watch(
      (value) => {
        setInputCount(value.title?.length || 0)
      },
      { name: 'title' }
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex flex-col">
      <div className="flex w-[492px] items-center rounded-full border bg-white pr-4">
        <Input
          id="title"
          type="text"
          placeholder={placeholder}
          className={cn(
            inputStyle,
            'w-[438px] border-none px-4 placeholder:text-sm focus-visible:ring-0'
          )}
          maxLength={120}
          {...register('title', {
            required: true
          })}
          onChange={(e) => {
            if (e.target.value.length > 120) {
              e.preventDefault()
              return
            }
            setValue('title', e.target.value)
          }}
        />
        <span className="text-sm text-[#8A8A8A]">{inputCount}/120</span>
      </div>
      {errors.title &&
        (errors.title?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.title.message?.toString()} />
        ))}
    </div>
  )
}
