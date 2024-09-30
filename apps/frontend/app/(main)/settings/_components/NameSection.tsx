import { Input } from '@/components/ui/input'
import type { SettingsFormat } from '@/types/type'
import React from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface NameSectionProps {
  isLoading: boolean
  updateNow: boolean
  defaultProfileValues: { userProfile?: { realName?: string } }
  register: UseFormRegister<SettingsFormat>
  errors: FieldErrors<SettingsFormat>
  realName: string
}

export default function NameSection({
  isLoading,
  updateNow,
  defaultProfileValues,
  register,
  errors,
  realName
}: NameSectionProps) {
  return (
    <>
      <label className="-mb-4 text-xs">Name</label>
      <Input
        placeholder={
          isLoading
            ? 'Loading...'
            : defaultProfileValues.userProfile?.realName || 'Enter your name'
        }
        disabled={!!updateNow}
        {...register('realName')}
        className={`${realName && (errors.realName ? 'border-red-500' : 'border-primary')} placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200`}
      />
      {realName && errors.realName && (
        <div className="-mt-4 inline-flex items-center text-xs text-red-500">
          {errors.realName.message}
        </div>
      )}
    </>
  )
}
