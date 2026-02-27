import { useTranslate } from '@tolgee/react'
import { useSettingsContext } from './context'

export function TopicSection() {
  const { updateNow } = useSettingsContext()
  const { t } = useTranslate()

  return (
    <>
      <h1 className="-mb-1 text-center text-2xl font-bold">
        {t('settings_title')}
      </h1>
      <p className="text-center text-sm text-neutral-500">
        {updateNow
          ? t('update_information_required')
          : t('change_information_optional')}
      </p>
    </>
  )
}
