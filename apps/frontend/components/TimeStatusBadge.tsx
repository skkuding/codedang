import { cn } from '@/libs/utils'

interface TimeStatusBadgeProps {
  status: string
}

export function TimeStatusBadge({ status }: TimeStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    UPCOMING: 'bg-color-yellow-95 text-color-orange-50',
    ONGOING: 'text-primary bg-color-blue-95',
    ENDED: 'text-color-pink-50 bg-color-pink-95'
  }

  return (
    <div
      className={cn(
        'flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]',
        statusStyles[status]
      )}
    >
      <span>{status}</span>
    </div>
  )
}
