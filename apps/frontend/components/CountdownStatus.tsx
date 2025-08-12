'use client'

import { cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useInterval } from 'react-use'

dayjs.extend(duration)

interface CountdownStatusProps {
  showIcon?: boolean
  textStyle?: string
  baseTime: Date
  target: string
}

export function CountdownStatus({
  showIcon = true,
  baseTime,
  target,
  textStyle
}: CountdownStatusProps) {
  const [isFinished, setIsFinished] = useState(false)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateStatus = useCallback(() => {
    const now = dayjs()
    const isFinished = now.isAfter(baseTime)
    setIsFinished(isFinished)

    const diff = dayjs.duration(Math.abs(dayjs(baseTime).diff(now)))
    setTimeDiff({
      days: Math.floor(diff.asDays()),
      hours: diff.hours().toString().padStart(2, '0'),
      minutes: diff.minutes().toString().padStart(2, '0'),
      seconds: diff.seconds().toString().padStart(2, '0')
    })
  }, [baseTime])

  useEffect(() => {
    updateStatus()
  }, [])

  useInterval(updateStatus, 1000)

  return (
    <div
      className={cn(
        'text-error inline-flex gap-1 whitespace-nowrap text-sm font-medium',
        textStyle
      )}
    >
      {showIcon && <Image src={clockIcon} alt="calendar" width={14} />}
      {target} {isFinished ? 'ended' : 'ends in'}
      {!isFinished && (
        <p className="overflow-hidden text-ellipsis whitespace-nowrap">
          {timeDiff.days > 0
            ? `${timeDiff.days} DAYS`
            : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
        </p>
      )}
    </div>
  )
}
