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
    getValues,
    formState: { errors },
    setValue
  } = useFormContext()

  const { field } = useController({
    name,
    defaultValue: getValues(name)
  })

  return (
    <div className="flex flex-col gap-1">
      <OptionSelect
        className="w-full"
        options={items.map(String)}
        value={field.value ?? ''}
        onChange={(value) => {
          field.onChange(value)
          setValue(name, value)
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
