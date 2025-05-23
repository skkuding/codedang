'use client'

import { cn } from '@/libs/utils'
import type { AssignmentStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'

dayjs.extend(duration)
interface StatusTimeDiffProps {
  textStyle?: string
  baseTime: Date
  target: string
}

export function StatusTimeDiff({
  textStyle,
  baseTime,
  target
}: StatusTimeDiffProps) {
  const [assignmentStatus, setAssignmentStatus] = useState<
    AssignmentStatus | undefined | null
  >('upcoming')
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateStatus = () => {
    const now = dayjs()
    if (now.isAfter(baseTime)) {
      setAssignmentStatus('finished')
    } else {
      setAssignmentStatus('ongoing')
    }

    const diff = dayjs.duration(Math.abs(dayjs(baseTime).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const hourStr = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minuteStr = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const secondStr = seconds.toString().padStart(2, '0')

    setTimeDiff({
      days,
      hours: hourStr,
      minutes: minuteStr,
      seconds: secondStr
    })
  }

  useEffect(() => {
    updateStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    updateStatus()
  }, 1000)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap opacity-80',
        textStyle
      )}
    >
      {target} {assignmentStatus === 'ongoing' ? 'ends in' : 'starts in'}
      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
        {timeDiff.days > 0
          ? `${timeDiff.days} DAYS`
          : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
      </p>
    </div>
  )
}
