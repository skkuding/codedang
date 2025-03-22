'use client'

import { Button } from '@/components/shadcn/button'
import type { Language } from '@generated/graphql'
import { useCallback } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { Label } from '../../_components/Label'
import { CodeEditor, extensionMap, initAndFormat } from './editor'

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

  const handleFormat = useCallback(async () => {
    try {
      const filename = extensionMap[language] ?? 'main.c'
      const formatted = await initAndFormat(
        field.value || '',
        language,
        filename
      )
      field.onChange(formatted)
    } catch (error) {
      console.error('Code formatting failed:', error)
    }
  }, [field, language])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <Label required={false}>{language} Template</Label>
        <Button
          onClick={handleFormat}
          type="button"
          className="h-6 w-16 text-xs"
        >
          Format
        </Button>
      </div>
      <div className="flex flex-col content-end gap-1">
        <CodeEditor
          onChange={field.onChange}
          value={field.value as string}
          language={language}
          className="max-h-96 min-h-16 w-[760px] rounded-lg"
        />
        {errors[name] && <ErrorMessage />}
      </div>
    </div>
  )
}
