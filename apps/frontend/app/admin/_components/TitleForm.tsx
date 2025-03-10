'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../_libs/utils'
import { ErrorMessage } from './ErrorMessage'

export function TitleForm({ placeholder }: { placeholder: string }) {
  const {
    register,
    formState: { errors }
  } = useFormContext()
  const [inputCount, setInputCount] = useState(0)

  const onInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCount(e.target.value.length)
  }

  return (
    <div className="relative">
      <Input
        id="title"
        type="text"
        placeholder={placeholder}
        className={cn(inputStyle, 'w-[492px] px-4 placeholder:text-sm')}
        {...register('title', {
          required: true
        })}
        onChange={onInputHandler}
      />
      <span className="absolute right-4 top-[24%] text-sm text-[#8A8A8A]">
        {inputCount}/120
      </span>
      {errors.title &&
        (errors.title?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.title.message?.toString()} />
        ))}
    </div>
  )
}
