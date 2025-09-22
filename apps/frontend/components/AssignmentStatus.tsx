import { DateRangeDisplay } from '@/components/DateRangeDisplay'
import { hasDueDate } from '@/libs/utils'
import { DeadlineStatus } from './DeadlineStatus'

interface AssignmentStatusProps {
  startTime: Date
  dueTime: Date
  endTime: Date
}

export function AssignmentStatus({
  startTime,
  dueTime,
  endTime
}: AssignmentStatusProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {hasDueDate(dueTime) && (
        <DeadlineStatus startTime={startTime} endTime={dueTime} />
      )}
      <DateRangeDisplay startTime={startTime} endTime={endTime} />
    </div>
  )
}
