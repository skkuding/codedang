import { formatDateRange } from '@/libs/utils'
import CalendarIcon from '@/public/icons/calendar.svg'

interface DateRangeDisplayProps {
  startTime: Date
  endTime: Date
}

export function DateRangeDisplay({
  startTime,
  endTime
}: DateRangeDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-normal">
      <CalendarIcon width={14} />
      <p>{formatDateRange(startTime, endTime)}</p>
    </div>
  )
}
