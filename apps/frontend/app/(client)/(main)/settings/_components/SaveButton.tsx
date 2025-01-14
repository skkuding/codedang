import { Button } from '@/components/shadcn/button'
import { useSettingsContext } from './context'

interface SaveButtonProps {
  saveAbleUpdateNow: boolean
  saveAble: boolean
  isLoading: boolean // 로딩 상태 추가
  onSubmitClick: () => void
}

export default function SaveButton({
  saveAbleUpdateNow,
  isLoading,
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
        {isLoading ? 'Saving...' : 'Save'}{' '}
        {/* 로딩 상태에 따라 버튼 텍스트 변경 */}
      </Button>
    </div>
  )
}
