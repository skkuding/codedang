'use client'

import { TextEditor } from '@/components/TextEditor'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'

interface DescriptionFormProps {
  name: string
  isDarkmode?: boolean
}

export function DescriptionForm({
  name,
  isDarkmode = false
}: DescriptionFormProps) {
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
        isDarkMode={isDarkmode}
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
