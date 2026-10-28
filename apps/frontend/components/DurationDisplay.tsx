import { dateFormatter } from '@/libs/utils'
import ClockIcon from '@/public/icons/clock.svg'
import InvisibleOrangeIcon from '@/public/icons/invisible-orange.svg'
import SubtractIcon from '@/public/icons/subtract.svg'
import dayjs from 'dayjs'
import { TimeStatusBadge } from './TimeStatusBadge'
import { Skeleton } from './shadcn/skeleton'

interface DurationDisplayProps {
  startTime?: Date
  isLoading?: boolean
  endTime: Date
  title: string
}

export function DurationDisplay({
  startTime,
  endTime,
  title,
  isLoading = false
}: DurationDisplayProps) {
  const titleIcons = {
    duration: <ClockIcon className="text-flowkit-red h-5" />,
    visible: <InvisibleOrangeIcon className="w-5" />,
    registration: <SubtractIcon className="w-5" />
  }
  const titleIcon = titleIcons[title as keyof typeof titleIcons] || (
    <ClockIcon className="text-flowkit-red h-5" />
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
    <div className="flex min-h-7 items-center gap-2 whitespace-nowrap">
      <div className="flex shrink-0 items-center gap-[6px]">
        {titleIcon}
        <span className={titleStyle}>{title} :</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-[250px]" />
      ) : (
        <DurationDate startTime={startTime} endTime={endTime} />
      )}
    </div>
  )
}

interface DurationDateProps {
  startTime?: Date
  endTime: Date
}

function DurationDate({ startTime, endTime }: DurationDateProps) {
  const currentTime = dayjs()

  return (
    <>
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
    </>
  )
}
