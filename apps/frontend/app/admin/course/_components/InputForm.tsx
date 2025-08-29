'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { inputStyle } from '../../_libs/utils'

interface InputFormProps {
  placeholder: string
  className?: string
  name: string
  maxLength?: number
  type: 'text' | 'email' | 'number'
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export function InputForm({
  placeholder,
  className,
  name,
  maxLength,
  type,
  value,
  onChange,
  disabled = false
}: InputFormProps) {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext()

  const watchedValue = watch(name)
  const inputCount = (value ?? watchedValue ?? '').length

  return (
    <div className={cn(className, 'flex w-full flex-col gap-1')}>
      <div className="flex items-center rounded-full border bg-white pr-4">
        <Input
          id={name}
          type={type}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          className={cn(
            inputStyle,
            'h-[40px] border-none px-4 placeholder:text-sm focus-visible:ring-0'
          )}
          maxLength={maxLength || 120}
          {...register(name, {
            setValueAs: (value) => (type === 'number' ? Number(value) : value)
          })}
          onChange={(e) => {
            if (onChange) {
              onChange(e)
            }
            if (maxLength && e.target.value.length > maxLength) {
              e.preventDefault()
              return
            }
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
