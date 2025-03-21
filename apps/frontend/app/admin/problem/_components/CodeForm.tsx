'use client'

import type { Language } from '@generated/graphql'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { CodeEditor } from './editor'

interface CodeFormProps {
  name: string
  language: Exclude<Language, 'Golang' | 'Python2'>
}

export function CodeForm({ name, language }: CodeFormProps) {
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
      <CodeEditor
        onChange={field.onChange}
        value={field.value as string}
        language={language}
        className="max-h-96 min-h-16 w-[760px] rounded-lg"
      />
      {errors[name] && <ErrorMessage />}
    </div>
  )
}
