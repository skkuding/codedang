import { Button } from '@/components/shadcn/button'
import { useSettingsContext } from './context'

interface SaveButtonProps {
  saveAbleUpdateNow: boolean
  saveAble: boolean
  onSubmitClick: () => void
}

export default function SaveButton({
  saveAbleUpdateNow,
  saveAble,
  onSubmitClick
}: SaveButtonProps) {
  const { updateNow } = useSettingsContext()

  return (
    <div className="mt-2 text-end">
      <Button
        disabled={updateNow ? !saveAbleUpdateNow : !saveAble}
        type="submit"
        className="font-semibold disabled:bg-neutral-300 disabled:text-neutral-500"
        onClick={onSubmitClick}
      >
        Save
      </Button>
    </div>
  )
}
