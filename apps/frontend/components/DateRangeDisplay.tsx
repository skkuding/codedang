import { VisibleIcon } from '@/components/Icons'
import dayjs from 'dayjs'

interface DateRangeDisplayProps {
  startTime: Date
  endTime: Date
}

export function DateRangeDisplay({
  startTime,
  endTime
}: DateRangeDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-base">
      <VisibleIcon className="fill-orange-500" />
      <span className="font-medium text-orange-500">Visible : </span>
      <span className="text-base">
        {dayjs(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
        {dayjs(endTime).format('YYYY-MM-DD HH:mm')}
      </span>
      <div className="bg-color-orange-95 text-color-orange-50 flex h-6 w-[62px] flex-shrink-0 items-center justify-center rounded-full text-[14px] font-medium">
        {dayjs().isAfter(endTime) && <span>Ended</span>}
        {dayjs().isSame(dayjs(endTime), 'day') && <span>D-Day</span>}
        {dayjs().isBefore(dayjs(endTime), 'day') && (
          <span>D-{dayjs(endTime).diff(dayjs(), 'day')}</span>
        )}
      </div>
      {/* <p>{formatDateRange(startTime, endTime)}</p> */}
    </div>
  )
}
