'use client'

import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'
import { TextEditor } from './TextEditor'

export function DescriptionForm({ name }: { name: string }) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  return (
    <div className="flex flex-col gap-1">
      <TextEditor
        placeholder="Enter a description..."
        onChange={field.onChange}
        defaultValue={field.value as string}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
