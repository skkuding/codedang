'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { cn } from '@/libs/utils'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { formVariants } from './FormStyles'

interface DropdownFormProps {
  name: string
  size?: 'large' | 'middle' | 'small'
  label?: string
  placeholder?: string
  items: (string | number | { label: string; value: string | number })[]
}

export function DropdownForm({
  name,
  size = 'middle',
  label,
  placeholder,
  items
}: DropdownFormProps) {
  const {
    formState: { errors }
  } = useFormContext()

  const normalizedItems = items.map((item) =>
    typeof item === 'object'
      ? item
      : {
          label: String(item),
          value: item
        }
  )
  const areValuesNumeric = normalizedItems.every(
    (item) => typeof item.value === 'number'
  )

  const { field } = useController({
    name,
    defaultValue: ''
  })

  const labelGap = { large: 'gap-2', middle: 'gap-1.5', small: 'gap-1' }
  const status = errors[name] ? 'error' : 'default'

  return (
    <div className={cn('flex flex-col', labelGap[size])}>
      {label && (
        <p
          className={cn(
            'text-color-neutral-15 text-sub3_sb_16 flex gap-1',
            size === 'small' && 'text-sub4_sb_14'
          )}
        >
          {label}
        </p>
      )}
      <OptionSelect
        className={cn('w-full', formVariants({ size, status }))}
        placeholder={placeholder}
        options={normalizedItems.map((item) => ({
          label: item.label,
          value: String(item.value)
        }))}
        value={
          areValuesNumeric ? String(field.value ?? '') : (field.value ?? '')
        }
        onChange={(value) => {
          field.onChange(areValuesNumeric ? Number(value) : value)
        }}
      />
      {errors[name] &&
        (errors[name]?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors[name].message?.toString()} />
        ))}
    </div>
  )
}
