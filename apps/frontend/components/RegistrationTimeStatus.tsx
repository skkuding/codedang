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
      <Image src={subtractIcon} alt="subtract" width={18} />
      <p className="text-primary font-medium">Registration :</p>
      <p className="text-color-neutral-30 text-base">
        {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(registerDueTime, 'YYYY-MM-DD HH:mm')}
      </p>
      <div className="bg-color-blue-95 text-color-blue-50 flex h-6 w-auto flex-shrink-0 items-center justify-center rounded-full px-3 text-[14px] font-medium">
        {dayjs().isAfter(registerDueTime) && <span>Ended</span>}
        {dayjs().isSame(dayjs(registerDueTime), 'day') && <span>D-Day</span>}
        {dayjs().isAfter(dayjs(startTime)) &&
          dayjs().isBefore(dayjs(registerDueTime), 'day') && (
            <span>D-{dayjs(registerDueTime).diff(dayjs(), 'day')}</span>
          )}
        {dayjs().isBefore(dayjs(startTime)) && <span>Upcoming</span>}
      </div>
    </div>
  )
}
