'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Label } from '@/app/admin/_components/Label'
import { Switch } from '@/components/shadcn/switch'
import React from 'react'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

interface SampleTestcaseFormProps {
  name: string
  title: string
}

export function SampleTestcaseForm({ name, title }: SampleTestcaseFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext()

  const isEnabled = watch(name) ?? false

  useEffect(() => {
    setValue(name, false)
  }, [])

  return (
    <div className="flex items-center gap-3">
      <Label required={false}>{title}</Label>

      <Switch
        {...register(name)}
        onCheckedChange={(checked) => {
          setValue(name, checked)
        }}
        checked={isEnabled}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
      />
      {isEnabled && errors[name] && (
        <ErrorMessage message={errors[name]?.message?.toString()} />
      )}
    </div>
  )
}
