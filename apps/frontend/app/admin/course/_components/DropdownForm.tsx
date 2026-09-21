'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
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
  disabled?: boolean
}

export function DropdownForm({
  name,
  size = 'middle',
  label,
  placeholder,
  items,
  disabled
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
  let status: 'default' | 'error' | 'disabled' = 'default'

  if (errors[name]) {
    status = 'error'
  }
  if (disabled) {
    status = 'disabled'
  }

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
      {/* <OptionSelect
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
      /> */}
      <Select
        value={
          areValuesNumeric ? String(field.value ?? '') : (field.value ?? '')
        }
        onValueChange={(value) => {
          field.onChange(areValuesNumeric ? Number(value) : value)
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            'focus:ring-primary text-body1_m_16 data-[placeholder]:text-color-neutral-90 w-full rounded-full p-4 focus:ring-offset-0',
            size === 'small' && 'text-body2_m_14',
            formVariants({ size, status }),
            disabled &&
              'data-[placeholder]:text-color-neutral-90 bg-color-neutral-95',
            '[&>svg]:text-color-common-0 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:opacity-100'
          )}
        >
          <SelectValue
            placeholder={placeholder}
            className={cn(
              disabled && 'text-color-neutral-90 bg-color-neutral-95'
            )}
          />
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] rounded-xl bg-white">
          <ScrollArea>
            <SelectGroup className="flex flex-col gap-1 p-5">
              {normalizedItems.map((option) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                  className="cursor-pointer hover:bg-gray-100/80"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
      {errors[name] &&
        !disabled &&
        (errors[name]?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors[name].message?.toString()} />
        ))}
    </div>
  )
}
