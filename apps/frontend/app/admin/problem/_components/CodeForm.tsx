'use client'

import { Button } from '@/components/shadcn/button'
import { Switch } from '@/components/shadcn/switch'
import type { Language } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useCallback, useEffect, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { Label } from '../../_components/Label'
import { CodeEditor, extensionMap, initAndFormat } from './editor'

interface CodeFormProps {
  name: string
  language: Language
  hasValue?: boolean
  variant: 'template' | 'solution'
}

export function CodeForm({
  name,
  language,
  hasValue = false,
  variant
}: CodeFormProps) {
  const { t } = useTranslate()
  const [isEnabled, setIsEnabled] = useState(false)
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  useEffect(() => {
    setIsEnabled(hasValue)
  }, [])

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
        <div className="flex items-center gap-2">
          <Label required={false}>
            {language} {variant === 'template' ? t('template') : t('solution')}
          </Label>
          <Switch
            onCheckedChange={() => {
              setValue(name, '')
              setIsEnabled(!isEnabled)
            }}
            checked={isEnabled}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
          />
        </div>
        {isEnabled && (
          <Button
            onClick={handleFormat}
            type="button"
            className="h-6 w-16 text-xs"
          >
            {t('format')}
          </Button>
        )}
      </div>
      {isEnabled && (
        <div className="relative flex min-h-36 flex-col gap-1 rounded-lg bg-[#121728]">
          {/* NOTE: 코드 없을 때 Gutter Background를 채우기 위한 div */}
          <div className="absolute h-full w-[30px] rounded-l-lg bg-[#272E48]" />
          <CodeEditor
            onChange={field.onChange}
            value={field.value as string}
            language={language}
            className="max-h-96 min-h-16 w-[760px] rounded-lg"
          />
          {errors[name] && <ErrorMessage />}
        </div>
      )}
    </div>
  )
}
