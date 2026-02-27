import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useSettingsContext } from './context'

interface NameSectionProps {
  realName: string
}

export function NameSection({ realName }: NameSectionProps) {
  const {
    isLoading,
    updateNow,
    defaultProfileValues,
    formState: { register, errors }
  } = useSettingsContext()

  const { t } = useTranslate()

  return (
    <>
      <label className="-mb-4 text-xs">{t('name_label')}</label>
      <Input
        placeholder={
          isLoading
            ? t('loading_placeholder')
            : defaultProfileValues.userProfile?.realName ||
              t('enter_name_placeholder')
        }
        disabled={Boolean(updateNow)}
        {...register('realName')}
        className={cn(
          realName && (errors.realName ? 'border-red-500' : 'border-primary'),
          'placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200'
        )}
      />
      {realName && errors.realName && (
        <div className="-mt-4 inline-flex items-center text-xs text-red-500">
          {errors.realName.message}
        </div>
      )}
    </>
  )
}
