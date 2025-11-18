import { dateFormatter } from '@/libs/utils'
import clockRedIcon from '@/public/icons/clock_red.svg'
import inivisbleOrangeIcon from '@/public/icons/invisible-orange.svg'
import subtractIcon from '@/public/icons/subtract.svg'
import dayjs from 'dayjs'
import Image from 'next/image'
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
    duration: clockRedIcon,
    visible: inivisbleOrangeIcon,
    registration: subtractIcon
  }
  const titleIcon = titleIcons[title as keyof typeof titleIcons] || clockRedIcon

  const titleDesigns = {
    duration: 'text-error text-base font-medium capitalize',
    visible: 'font-medium text-orange-500 capitalize',
    registration: 'text-primary font-medium capitalize'
  }

  const titleStyle =
    titleDesigns[title as keyof typeof titleDesigns] ??
    'text-error text-base font-medium'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className="flex items-center gap-[6px]">
          <Image src={titleIcon} alt="Icon" width={20} />
          <span className={titleStyle}>{title} :</span>
        </div>
        <span className="text-color-neutral-30 text-base">
          {dateFormatter(startTime ?? '', 'YYYY-MM-DD HH:mm')} ~{' '}
          {dateFormatter(endTime ?? '', 'YYYY-MM-DD HH:mm')}
        </span>
        <div>
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
    </div>
  )
}
