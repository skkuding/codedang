import { Badge } from '@/components/shadcn/badge'

export function AddBadge({ onClick }: { onClick: () => void }) {
  return (
    <Badge
      onClick={onClick}
      className="shadow-2xs text-caption2_m_12 h-6 w-14 cursor-pointer items-center justify-center border border-gray-200 bg-gray-200/60 p-0 text-gray-700 hover:bg-gray-200"
    >
      + add
    </Badge>
  )
}
