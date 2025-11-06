//import { CountdownStatus } from '@/components/CountdownStatus'
//import { DateRangeDisplay } from '@/components/DateRangeDisplay'
//import { hasDueDate } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import clockRedIcon from '@/public/icons/clock_red.svg'
import inivisbleOrangeIcon from '@/public/icons/invisible-orange.svg'
import subtractIcon from '@/public/icons/subtract.svg'
import dayjs from 'dayjs'
import Image from 'next/image'
import { FaCirclePlay } from 'react-icons/fa6'

interface AssignmentStatusProps {
  startTime: Date
  endTime: Date
  title: string
  showOnGoing?: boolean
}

export function AssignmentStatus({
  startTime,
  endTime,
  title,
  showOnGoing = false
}: AssignmentStatusProps) {
  const now = dayjs()

  const titleIcons = {
    Duration: clockRedIcon,
    Visible: inivisbleOrangeIcon,
    Registration: subtractIcon
  }
  const titleIcon = titleIcons[title as keyof typeof titleIcons] || clockRedIcon

  const titleDesigns = {
    Duration: 'text-error text-base font-medium',
    Visible: 'font-medium text-orange-500',
    Registration: 'text-primary font-medium'
  }

  const titleStyle =
    titleDesigns[title as keyof typeof titleDesigns] ??
    'test-error text-base font-medium'

  return (
    <div className="flex flex-col gap-1">
      {showOnGoing && now.isAfter(startTime) && now.isBefore(endTime) && (
        <div className="text-primary flex items-center gap-2 text-sm font-semibold">
          <FaCirclePlay size={14} />
          <p>ONGOING</p>
        </div>
      )}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className="flex items-center gap-[6px]">
          <Image src={titleIcon} alt="Icon" width={20} />
          <span className={titleStyle}>{title} :</span>
        </div>
        <span className="text-color-neutral-30 text-base">
          {dateFormatter(startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
          {dateFormatter(endTime, 'YYYY-MM-DD HH:mm')}
        </span>
        <div>
          {dayjs().isAfter(endTime) && (
            <div className="bg-color-pink-95 text-color-pink-50 flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
              <span>ENDED</span>
            </div>
          )}
          {dayjs().isAfter(dayjs(startTime)) &&
            dayjs().isBefore(dayjs(endTime)) && (
              <div className="bg-color-blue-95 text-primary flex h-7 w-20 flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
                <span>ONGOING</span>
              </div>
            )}
          {dayjs().isBefore(dayjs(startTime)) && (
            <div className="bg-color-yellow-95 text-color-orange-50 flex h-7 w-auto flex-shrink-0 items-center justify-center rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.42px]">
              <span>UPCOMING</span>
            </div>
          )}
        </div>
        {/* <DateRangeDisplay startTime={startTime} endTime={dueTime} />
      {hasDueDate(dueTime) && <CountdownStatus baseTime={dueTime} />} */}
      </div>
    </div>
  )
}
