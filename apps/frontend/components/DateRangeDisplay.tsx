import { formatDateRange } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import Image from 'next/image'

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
      <Image src={calendarIcon} alt="calendar" width={14} />
      <p>{formatDateRange(startTime, endTime)}</p>
    </div>
  )
}
