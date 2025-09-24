'use client'

import dayjs from 'dayjs'

interface DateRangeDisplayProps {
  startTime: Date
  endTime: Date
}

export function TimeStatusBadge({ startTime, endTime }: DateRangeDisplayProps) {
  return (
    <div>
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
