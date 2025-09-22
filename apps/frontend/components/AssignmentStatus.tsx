import { DateRangeDisplay } from '@/components/DateRangeDisplay'
import { hasDueDate } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import dayjs from 'dayjs'
import Image from 'next/image'

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
      {/* {now.isAfter(startTime) && now.isBefore(dueTime) && (
        <div className="text-primary flex items-center gap-2 text-sm font-semibold">
          <FaCirclePlay size={14} />
          <p>ONGOING</p>
        </div>
      )} */}
      {hasDueDate(dueTime) && (
        <div className="inline-flex gap-2 whitespace-nowrap">
          <Image src={clockIcon} alt="calendar" width={20} />
          <span className="text-error text-base font-medium">Deadline :</span>
          <span className="text-base">
            {dayjs(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
            {dayjs(dueTime).format('YYYY-MM-DD HH:mm')}
          </span>
          <div className="bg-color-red-95 text-color-red-60 flex h-6 w-[62px] flex-shrink-0 items-center justify-center rounded-full text-[14px] font-medium">
            {dayjs().isAfter(dueTime) && <span>Ended</span>}
            {dayjs().isSame(dayjs(dueTime), 'day') && <span>D-Day</span>}
            {dayjs().isBefore(dayjs(dueTime), 'day') && (
              <span>D-{dayjs(dueTime).diff(dayjs(), 'day')}</span>
            )}
          </div>
        </div>
      )}
      <DateRangeDisplay startTime={startTime} endTime={endTime} />
    </div>
  )
}
