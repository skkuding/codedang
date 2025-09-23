import { dateFormatter } from '@/libs/utils'
import subtractIcon from '@/public/icons/subtract.svg'
import dayjs from 'dayjs'
import Image from 'next/image'

interface DateRangeDisplayProps {
  startTime: Date
  registerDueTime: Date
}

export function RegistrationTimeStatus({
  startTime,
  registerDueTime
}: DateRangeDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-[6px]">
        <Image src={subtractIcon} alt="subtract" width={18} />
        <span className="text-primary font-medium">Registration :</span>
      </div>
      <span className="text-color-neutral-30 text-base">
        {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(registerDueTime, 'YYYY-MM-DD HH:mm')}
      </span>
      {dayjs().isAfter(registerDueTime) && (
        <div className="bg-color-pink-95 text-color-pink-50 flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
          <span>ENDED</span>
        </div>
      )}
      {dayjs().isAfter(dayjs(startTime)) &&
        dayjs().isBefore(dayjs(registerDueTime)) && (
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
