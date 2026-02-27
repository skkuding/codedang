import { Badge } from '@/components/shadcn/badge'
import { useTranslate } from '@tolgee/react'

export function AddBadge({ onClick }: { onClick: () => void }) {
  const { t } = useTranslate()
  return (
    <Badge
      onClick={onClick}
      className="shadow-2xs h-6 w-14 cursor-pointer items-center justify-center border border-gray-200 bg-gray-200/60 p-0 text-xs font-medium text-gray-700 hover:bg-gray-200"
    >
      {t('add_button')}
    </Badge>
  )
}
