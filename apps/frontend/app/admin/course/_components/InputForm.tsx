'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { inputStyle } from '../../_libs/utils'

interface InputFormProps {
  placeholder?: string
  className?: string
  label?: string
  isLabeled?: boolean
  name: string
  maxLength?: number
  type: 'text' | 'email' | 'number'
  size?: 'large' | 'middle' | 'small'
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export function InputForm({
  placeholder,
  className,
  label,
  isLabeled = Boolean(label),
  name,
  maxLength,
  type,
  size = 'middle',
  value,
  onChange,
  disabled = false
}: InputFormProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()

  const watchedValue = watch(name)
  const inputCount = String(value || watchedValue || '').length
  const error = Boolean(errors[name])

  const labelGap = { large: 'gap-2', middle: 'gap-1.5', small: 'gap-1' }

  const containerHeight = {
    large: 'h-[56px]',
    middle: 'h-[46px]',
    small: 'h-[38px]'
  }

  const containerRadius = {
    large: 'rounded-[12px]',
    middle: 'rounded-[12px]',
    small: 'rounded-[10px]'
  }

  return (
    <div className={cn(className, labelGap[size], 'flex w-full flex-col')}>
      <span
        className={cn(
          'text-color-neutral-15 text-sub3_sb_16 flex gap-1',
          size === 'small' && 'text-sub4_sb_14'
        )}
      >
        {label}
        {isLabeled && <span className="mt-0.5 text-red-500">*</span>}
      </span>
      <div
        className={cn(
          'border-line flex items-center gap-2 border bg-white pr-4',
          containerRadius[size],
          containerHeight[size],
          error && 'border-error',
          disabled && 'bg-color-neutral-95'
        )}
      >
        <Input
          id={name}
          type={type === 'number' ? 'text' : type}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          sizeVariant="md"
          className={cn(
            inputStyle,
            'placeholder:text-color-neutral-90 disabled:placeholder:text-color-neutral-60 disabled:bg-color-neutral-95 placeholder:text-body1_m_16 h-full rounded-full border-none px-4 focus-visible:ring-0',
            size === 'small' && 'placeholder:text-body2_m_14'
          )}
          maxLength={maxLength || 120}
          {...register(name, {
            setValueAs: (value) => {
              if (type === 'number') {
                return value === '' ? '' : Number(value)
              }
              return value
            },
            onChange: (e) => {
              if (onChange) {
                onChange(e)
              }
              if (type === 'number') {
                e.target.value = e.target.value.replace(/[^0-9]/g, '')
              }
              if (maxLength && e.target.value.length > maxLength) {
                const trimmedValue = e.target.value.slice(0, maxLength)
                setValue(
                  name,
                  type === 'number' ? Number(trimmedValue) : trimmedValue
                )
                return
              }
            }
          })}
        />
        {maxLength && (
          <span
            className={cn(
              'text-color-cool-neutral-50 shrink-0 text-sm',
              error && 'text-error',
              disabled && 'text-color-cool-neutral-60'
            )}
          >
            {inputCount}/{maxLength}
          </span>
        )}
        <ChevronDown className="h-6 w-6 shrink-0" />
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
