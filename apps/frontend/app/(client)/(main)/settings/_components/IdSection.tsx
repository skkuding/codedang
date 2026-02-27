import { Input } from '@/components/shadcn/input'
import { useTranslate } from '@tolgee/react'
import { useSettingsContext } from './context'

export function IdSection() {
  const { t } = useTranslate()
  const { isLoading, defaultProfileValues } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 text-xs">{t('id_label')}</label>
      <Input
        placeholder={
          isLoading ? t('loading_placeholder') : defaultProfileValues.username
        }
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
