'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Label } from '@/app/admin/_components/Label'
import { Switch } from '@/components/shadcn/switch'
import React from 'react'
import { useController, useFormContext } from 'react-hook-form'

interface EnableCopyPasteFormProps {
  name: string
  title: string
  hasValue?: boolean
}

export function EnableCopyPasteForm({
  name,
  title,
  hasValue = true
}: EnableCopyPasteFormProps) {
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
      <Label required={false}>{title}</Label>
      <Switch
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
