'use client'

import { Input } from '@/components/shadcn/input'
import { useSettingsContext } from './context'

export function EmailSection() {
  const { isLoading, defaultProfileValues } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">Email</label>
      <Input
        placeholder={
          isLoading
            ? 'Loading...'
            : defaultProfileValues.email || 'Email not available'
        }
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
