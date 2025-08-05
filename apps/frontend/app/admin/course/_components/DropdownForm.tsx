'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'

interface DropdownFormProps {
  name: string
  items: string[]
}

export function DropdownForm({ name, items }: DropdownFormProps) {
  const {
    watch,
    control,
    getValues,
    formState: { errors },
    setValue
  } = useFormContext()

  const watchedValue = watch(name)

  const { field } = useController({
    name,
    control,
    defaultValue: ''
  })

  return (
    <div className="flex flex-col gap-1">
      <OptionSelect
        className="w-full"
        options={items}
        value={field.value as string}
        onChange={field.onChange}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
