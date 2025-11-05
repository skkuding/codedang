'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Switch } from '@/components/shadcn/switch'
import React from 'react'
import { useController, useFormContext } from 'react-hook-form'

interface DisableCopyPasteFormProps {
  name: string
  title: string
  hasValue?: boolean
  disabled?: boolean
}

export function DisableCopyPasteForm({
  name,
  title,
  hasValue = true,
  disabled = false
}: DisableCopyPasteFormProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control,
    defaultValue: hasValue
  })
  return (
    <div className="flex items-center gap-3">
      {/* NOTE: opacity문제로 Label컴포넌트 이용 안함 */}
      <span className="text-lg font-semibold">{title} </span>
      <Switch
        onCheckedChange={(checked) => field.onChange(!checked)}
        checked={!field.value}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
        disabled={disabled}
      />
      {field.value && errors[name] && (
        <ErrorMessage message={errors[name]?.message?.toString()} />
      )}
    </div>
  )
}
