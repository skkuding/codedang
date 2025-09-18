'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'

interface DropdownFormProps {
  name: string
  items: (string | number)[]
}

export function DropdownForm({ name, items }: DropdownFormProps) {
  const {
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    defaultValue: ''
  })

  return (
    <div className="flex flex-col gap-1">
      <OptionSelect
        className="w-full"
        options={items.map(String)}
        value={
          items.every((item) => typeof item === 'number')
            ? String(field.value ?? '')
            : (field.value ?? '')
        }
        onChange={(value) => {
          field.onChange(
            items.every((item) => typeof item === 'number')
              ? Number(value)
              : value
          )
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
