import { cn } from '@/libs/utils'

interface TimeStatusBadgeProps {
  status: string
  endTime?: Date
}

export function TimeStatusBadge({ status, endTime }: TimeStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    upcoming: 'bg-color-yellow-95 text-color-orange-50',
    ongoing: 'text-primary bg-color-blue-95',
    ended: 'text-color-pink-50 bg-color-pink-95',
    undefined: 'opacity-0'
  }

  if (endTime) {
    const endDate = new Date(endTime)
    status = new Date() < endDate ? 'ongoing' : 'ended'
  }

  return (
    <div
      className={cn(
        'text-body2_m_14 flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-1',
        statusStyles[status]
      )}
    >
      <span className="uppercase">{status}</span>
    </div>
  )
}
