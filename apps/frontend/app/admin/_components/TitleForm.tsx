'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../_libs/utils'
import { ErrorMessage } from './ErrorMessage'

export function TitleForm({ placeholder }: { placeholder: string }) {
  const {
    register,
    formState: { errors }
  } = useFormContext()
  return (
    <>
      <Input
        id="title"
        type="text"
        placeholder={placeholder}
        className={cn(inputStyle, 'w-[500px]')}
        {...register('title', {
          required: true
        })}
      />
      {errors.title &&
        (errors.title?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.title.message?.toString()} />
        ))}
    </>
  )
}
