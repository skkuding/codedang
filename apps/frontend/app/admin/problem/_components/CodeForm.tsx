'use client'

import { Button } from '@/components/shadcn/button'
import type { Language } from '@generated/graphql'
import type * as clangFormat from '@wasm-fmt/clang-format'
import type * as pythonFormat from '@wasm-fmt/ruff_fmt'
import { useCallback } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { Label } from '../../_components/Label'
import { CodeEditor } from './editor'

let clangFormatter: typeof clangFormat.format
let pythonFormatter: typeof pythonFormat.format

let clangInitialized = false
let pythonInitialized = false

const clangConfig = JSON.stringify({
  BasedOnStyle: 'Chromium',
  IndentWidth: 2
})

const pythonConfig = {
  indent_width: 2
}

async function initFormatter(language: Language) {
  if ((language === 'C' || language === 'Cpp') && !clangInitialized) {
    const clang = await import('@wasm-fmt/clang-format')
    await clang.default()
    clangFormatter = clang.format
    clangInitialized = true
  } else if (language === 'Python3' && !pythonInitialized) {
    const python = await import('@wasm-fmt/ruff_fmt')
    await python.default()
    pythonFormatter = python.format
    pythonInitialized = true
  }
}

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
      await initFormatter(language)

      const extensionMap: Record<
        Exclude<Language, 'Golang' | 'Python2'>,
        string
      > = {
        C: 'main.c',
        Cpp: 'main.cpp',
        Java: 'Main.java',
        Python3: 'main.py'
      }

      const filename = extensionMap[language] ?? 'main.c'

      if (language === 'C' || language === 'Cpp') {
        const formatted = clangFormatter(
          field.value || '',
          filename,
          clangConfig
        )
        field.onChange(formatted)
      } else if (language === 'Python3') {
        const formatted = pythonFormatter(
          field.value || '',
          filename,
          pythonConfig
        )
        field.onChange(formatted)
      }
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
