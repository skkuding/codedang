'use client'

import { Input } from '@/components/shadcn/input'
import { useTranslate } from '@tolgee/react'
import { useSettingsContext } from './context'

export function EmailSection() {
  const { isLoading, defaultProfileValues } = useSettingsContext()
  const { t } = useTranslate()

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">{t('email_label')}</label>
      <Input
        placeholder={
          isLoading
            ? t('loading_placeholder')
            : defaultProfileValues.email || t('email_not_available_placeholder')
        }
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
