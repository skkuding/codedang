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
    <div className="text-body4_r_14 flex items-center gap-2">
      <Image src={calendarIcon} alt="calendar" width={14} />
      <p>{formatDateRange(startTime, endTime)}</p>
    </div>
  )
}
