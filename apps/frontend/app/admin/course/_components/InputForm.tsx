'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { inputStyle } from '../../_libs/utils'

interface InputFormProps {
  placeholder: string
  className?: string
  name: string
  maxLength?: number
  type: 'text' | 'email' | 'number'
}

export function InputForm({
  placeholder,
  className,
  name,
  maxLength,
  type
}: InputFormProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()
  const [inputCount, setInputCount] = useState(0)
  const watchedValue = watch(name)

  useEffect(() => {
    setInputCount(watchedValue?.length || 0)
  }, [watchedValue])

  return (
    <div className={cn(className, 'flex w-full flex-col')}>
      <div className="flex items-center rounded-full border bg-white pr-4">
        <Input
          id={name} // key 대신 name 사용
          type={type}
          placeholder={placeholder}
          className={cn(
            inputStyle,
            'h-[40px] border-none px-4 placeholder:text-sm focus-visible:ring-0'
          )}
          maxLength={maxLength || 120}
          {...register(name, {
            required: true
          })}
          onChange={(e) => {
            if (e.target.value.length > (maxLength || 120)) {
              e.preventDefault()
              return
            }
            setValue(name, e.target.value) // key 대신 name 사용
          }}
        />
        {maxLength && (
          <span className="text-sm text-[#8A8A8A]">
            {inputCount}/{maxLength}
          </span>
        )}
      </div>
      {errors[name] &&
        (errors[name]?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors[name].message?.toString()} />
        ))}
    </div>
  )
}
