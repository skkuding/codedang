import { dateFormatter } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import dayjs from 'dayjs'
import Image from 'next/image'

interface DateRangeDisplayProps {
  startTime: Date
  endTime: Date
}

export function DeadlineStatus({ startTime, endTime }: DateRangeDisplayProps) {
  return (
    <div className="inline-flex gap-2 whitespace-nowrap">
      <Image src={clockIcon} alt="calendar" width={20} />
      <span className="text-error text-base font-medium">Deadline :</span>
      <span className="text-color-neutral-30 text-base">
        {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(endTime, 'YYYY-MM-DD HH:mm')}
      </span>
      <div className="bg-color-red-95 text-color-red-60 flex h-6 w-auto flex-shrink-0 items-center justify-center rounded-full px-3 text-[14px] font-medium">
        {dayjs().isAfter(endTime) && <span>Ended</span>}
        {dayjs().isSame(dayjs(endTime), 'day') && <span>D-Day</span>}
        {dayjs().isAfter(dayjs(startTime)) &&
          dayjs().isBefore(dayjs(endTime), 'day') && (
            <span>D-{dayjs(endTime).diff(dayjs(), 'day')}</span>
          )}
        {dayjs().isBefore(dayjs(startTime)) && <span>Upcoming</span>}
      </div>
    </div>
  )
}
