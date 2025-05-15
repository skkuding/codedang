import { StatusTimeDiff } from '@/components/StatusTimeDiff'
import { formatDateRange } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import clockIcon from '@/public/icons/clock.svg'
import Image from 'next/image'

interface AssignmentStatusProps {
  startTime: Date
  endTime: Date
  dueTime: Date
}

export function AssignmentStatus({
  startTime,
  endTime,
  dueTime
}: AssignmentStatusProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm font-normal">
        <Image src={calendarIcon} alt="calendar" width={14} />

        <p>{formatDateRange(startTime, endTime)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Image src={clockIcon} alt="calendar" width={14} />
        <StatusTimeDiff
          baseTime={dueTime}
          textStyle="text-sm font-medium text-[#FF3B2F]"
          target="Submission"
        />
      </div>
    </div>
  )
}
