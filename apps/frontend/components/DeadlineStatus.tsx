import { TimeStatusBadge } from '@/components/TimeStatusBadge'
import { dateFormatter } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import Image from 'next/image'

interface DateRangeDisplayProps {
  startTime: Date
  endTime: Date
}

export function DeadlineStatus({ startTime, endTime }: DateRangeDisplayProps) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className="flex items-center gap-[6px]">
        <Image src={clockIcon} alt="calendar" width={20} />
        <span className="text-error text-base font-medium">Duration :</span>
      </div>
      <span className="text-color-neutral-30 text-base">
        {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(endTime, 'YYYY-MM-DD HH:mm')}
      </span>
      <TimeStatusBadge startTime={startTime} endTime={endTime} />
    </div>
  )
}
