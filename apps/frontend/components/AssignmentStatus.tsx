import { CountdownStatus } from '@/components/CountdownStatus'
import { DateRangeDisplay } from '@/components/DateRangeDisplay'
import { hasDueDate } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'
import dayjs from 'dayjs'
import { FaCirclePlay } from 'react-icons/fa6'

interface AssignmentStatusProps {
  startTime: Date
  dueTime: Date
}

export async function AssignmentStatus({
  startTime,
  dueTime
}: AssignmentStatusProps) {
  const now = dayjs()
  const t = await getTranslate()

  return (
    <div className="flex flex-col gap-1">
      {now.isAfter(startTime) && now.isBefore(dueTime) && (
        <div className="text-primary flex items-center gap-2 text-sm font-semibold">
          <FaCirclePlay size={14} />
          <p>{t('ongoing_status')}</p>
        </div>
      )}
      <DateRangeDisplay startTime={startTime} endTime={dueTime} />
      {hasDueDate(dueTime) && <CountdownStatus baseTime={dueTime} />}
    </div>
  )
}
