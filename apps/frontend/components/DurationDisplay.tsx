import { dateFormatter } from '@/libs/utils'
import ClockIcon from '@/public/icons/clock.svg'
import TicketIcon from '@/public/icons/ticket.svg'
import VisibleIcon from '@/public/icons/visible-fill.svg'
import dayjs from 'dayjs'
import { TimeStatusBadge } from './TimeStatusBadge'

interface DurationDisplayProps {
  startTime?: Date
  endTime: Date
  title: string
}

export function DurationDisplay({
  startTime,
  endTime,
  title
}: DurationDisplayProps) {
  const currentTime = dayjs()

  const titleIcons = {
    duration: <ClockIcon className="text-flowkit-red size-5" />,
    visible: <VisibleIcon className="text-color-orange-50 size-5" />,
    registration: <TicketIcon className="text-primary size-5" />
  }
  const titleIcon = titleIcons[title as keyof typeof titleIcons] || (
    <ClockIcon className="text-flowkit-red size-5" />
  )

  const titleDesigns = {
    duration: 'text-error text-base font-medium capitalize',
    visible: 'font-medium text-orange-500 capitalize',
    registration: 'text-primary font-medium capitalize'
  }

  const titleStyle =
    titleDesigns[title as keyof typeof titleDesigns] ??
    'text-error text-base font-medium'

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className="flex shrink-0 items-center gap-[6px]">
        {titleIcon}
        <span className={titleStyle}>{title} :</span>
      </div>
      <span className="text-color-neutral-30 shrink-0 text-base">
        {dateFormatter(startTime ?? '', 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(endTime ?? '', 'YYYY-MM-DD HH:mm')}
      </span>
      <div className="shrink-0">
        {currentTime.isAfter(endTime) && <TimeStatusBadge status="ended" />}
        {currentTime.isAfter(dayjs(startTime)) &&
          currentTime.isBefore(dayjs(endTime)) && (
            <TimeStatusBadge status="ongoing" />
          )}
        {currentTime.isBefore(dayjs(startTime)) && (
          <TimeStatusBadge status="upcoming" />
        )}
      </div>
    </div>
  )
}
