'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Label } from '@/app/admin/_components/Label'
import { Switch } from '@/components/shadcn/switch'
import React from 'react'
import { useController, useFormContext } from 'react-hook-form'

interface SampleTestcaseFormProps {
  name: string
  title: string
  hasValue?: boolean
  disabled?: boolean
}

export function SampleTestcaseForm({
  name,
  title,
  hasValue = false,
  disabled = false
}: SampleTestcaseFormProps) {
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
      <Label disabled={disabled} required={false}>
        {title}
      </Label>
      <Switch
        disabled={disabled}
        onCheckedChange={field.onChange}
        checked={field.value}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
      />
      {field.value && errors[name] && (
        <ErrorMessage message={errors[name]?.message?.toString()} />
      )}
    </div>
  )
}
