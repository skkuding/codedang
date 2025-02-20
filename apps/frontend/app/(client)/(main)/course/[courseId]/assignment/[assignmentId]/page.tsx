'use client'

import { ContestStatusTimeDiff } from '@/components/ContestStatusTimeDiff'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import ClockIcon from '@/public/icons/clock.svg'
import Image from 'next/image'
import { useState } from 'react'

export default function AssignmentDetail() {
  // const formattedStartTime = dateFormatter(
  //   data.startTime,
  //   'YYYY-MM-DD HH:mm:ss'
  // )
  // const formattedEndTime = dateFormatter(data.endTime, 'YYYY-MM-DD HH:mm:ss')
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })
  return (
    <div>
      <div className="flex gap-2">
        <Image src={calendarIcon} alt="calendar" width={20} height={20} />
        {/* <p className="font-medium text-[#333333e6]">
          {formattedStartTime} ~ {formattedEndTime}
        </p> */}
      </div>
      <div className="flex">
        <Image src={ClockIcon} alt="Clock" />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          Ends in{' '}
          {timeDiff.days > 0
            ? `${timeDiff.days} DAYS`
            : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
        </span>
      </div>
    </div>
  )
}
