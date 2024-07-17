import { Badge } from '@/components/ui/badge'

export default function AddBadge({ onClick }: { onClick: () => void }) {
  return (
    <Badge
      onClick={onClick}
      className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
    >
      + add
    </Badge>
  )
}
