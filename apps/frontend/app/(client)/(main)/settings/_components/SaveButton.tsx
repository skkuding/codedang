import { Button } from '@/components/shadcn/button'

interface SaveButtonProps {
  updateNow: boolean
  saveAbleUpdateNow: boolean
  saveAble: boolean
  onSubmitClick: () => void
}

export default function SaveButton({
  updateNow,
  saveAbleUpdateNow,
  saveAble,
  onSubmitClick
}: SaveButtonProps) {
  return (
    <div className="mt-2 text-end">
      {/* asdfasdf */}
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
