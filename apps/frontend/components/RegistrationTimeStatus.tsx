import { TimeStatusBadge } from '@/components/TimeStatusBadge'
import { dateFormatter } from '@/libs/utils'
import subtractIcon from '@/public/icons/subtract.svg'
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
      <TimeStatusBadge startTime={startTime} endTime={registerDueTime} />
    </div>
  )
}
