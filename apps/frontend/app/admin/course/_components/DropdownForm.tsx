'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'

interface DropdownFormProps {
  name: string
  items: (string | number | { label: string; value: string | number })[]
}

export function DropdownForm({ name, items }: DropdownFormProps) {
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

  return (
    <div className="flex flex-col gap-1">
      <OptionSelect
        className="w-full"
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
