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
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className="flex items-center gap-[6px]">
        <Image src={clockIcon} alt="calendar" width={20} />
        <span className="text-error text-base font-medium">Duration :</span>
      </div>
      <span className="text-color-neutral-30 text-base">
        {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(endTime, 'YYYY-MM-DD HH:mm')}
      </span>
      {dayjs().isAfter(endTime) && (
        <div className="bg-color-pink-95 text-color-pink-50 flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
          <span>ENDED</span>
        </div>
      )}
      {dayjs().isAfter(dayjs(startTime)) &&
        dayjs().isBefore(dayjs(endTime)) && (
          <div className="bg-color-blue-95 text-primary flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
            <span>ONGOING</span>
          </div>
        )}
      {dayjs().isBefore(dayjs(startTime)) && (
        <div className="bg-color-yellow-95 text-color-orange-50 flex h-7 w-auto flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
          <span>UPCOMING</span>
        </div>
      )}
    </div>
  )
}
