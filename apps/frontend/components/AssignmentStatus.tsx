import { CountdownStatus } from '@/components/CountdownStatus'
import { DateRangeDisplay } from '@/components/DateRangeDisplay'
import { hasDueDate } from '@/libs/utils'
import dayjs from 'dayjs'
import { FaCirclePlay } from 'react-icons/fa6'

interface AssignmentStatusProps {
  startTime: Date
  dueTime: Date
}

export function AssignmentStatus({
  startTime,
  dueTime
}: AssignmentStatusProps) {
  const now = dayjs()

  return (
    <div className="flex flex-col gap-1">
      {now.isAfter(startTime) && now.isBefore(dueTime) && (
        <div className="text-primary flex items-center gap-2 text-sm font-semibold">
          <FaCirclePlay size={14} />
          <p>ONGOING</p>
        </div>
      )}
      <DateRangeDisplay startTime={startTime} endTime={dueTime} />
      {hasDueDate(dueTime) && <CountdownStatus baseTime={dueTime} />}
    </div>
  )
}
