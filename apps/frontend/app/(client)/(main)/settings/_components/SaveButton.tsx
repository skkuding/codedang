import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import { useSettingsContext } from './context'

interface SaveButtonProps {
  saveAbleUpdateNow: boolean
  saveAble: boolean
  onSubmitClick: () => void
}

export function SaveButton({
  saveAbleUpdateNow,
  saveAble,
  onSubmitClick
}: SaveButtonProps) {
  const { updateNow } = useSettingsContext()
  const { t } = useTranslate()

  return (
    <div className="mt-2 text-end">
      <Button
        disabled={updateNow ? !saveAbleUpdateNow : !saveAble}
        type="submit"
        className="font-semibold disabled:bg-neutral-300 disabled:text-neutral-500"
        onClick={onSubmitClick}
      >
        {t('save_button')}
      </Button>
    </div>
  )
}
