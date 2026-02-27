'use client'

import { DurationDisplay } from '@/components/DurationDisplay'
import { capitalizeFirstLetter, cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

interface CountdownStatusProps {
  showText?: boolean
  showIcon?: boolean
  showTarget?: boolean
  inEditor?: boolean
  textStyle?: string
  startTime?: Date
  baseTime: Date
  target?: string
}

export function CountdownStatus({
  showIcon = true,
  showText = false,
  showTarget = true,
  inEditor = false,
  startTime,
  baseTime,
  target,
  textStyle
}: CountdownStatusProps) {
  const router = useRouter()
  const { problemId, courseId, assignmentId, exerciseId } = useParams()
  const [isFinished, setIsFinished] = useState(() => {
    const now = dayjs()
    return now.isAfter(baseTime)
  })
  const isFinishedRef = useRef(isFinished)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateStatus = useCallback(() => {
    const now = dayjs()
    const isCurrentlyFinished = now.isAfter(baseTime)

    const diff = dayjs.duration(Math.abs(dayjs(baseTime).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const minutes = Math.floor(diff.asMinutes() % 60)
    const seconds = Math.floor(diff.asSeconds() % 60)

    setTimeDiff({
      days,
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    })

    if (inEditor) {
      if (isCurrentlyFinished && !isFinishedRef.current) {
        if (assignmentId) {
          router.push(
            `/course/${courseId}/assignment/${assignmentId}/finished/problem/${problemId}?force=true` as const
          )
        } else if (exerciseId) {
          router.push(
            `/course/${courseId}/exercise/${exerciseId}/finished/problem/${problemId}?force=true` as const
          )
        }
      }

      if (!isCurrentlyFinished && days === 0 && hours === 0) {
        if (minutes === 5 && seconds === 0) {
          toast.error('Submission ends in 5 minutes.', { duration: 10000 })
        }
        if (minutes === 1 && seconds === 0) {
          toast.error('Submission ends in 1 minute.', { duration: 10000 })
        }
      }
    }
    setIsFinished(isCurrentlyFinished)
    isFinishedRef.current = isCurrentlyFinished
  }, [
    baseTime,
    inEditor,
    isFinishedRef,
    assignmentId,
    exerciseId,
    router,
    courseId,
    problemId
  ])

  useEffect(() => {
    updateStatus()
  }, [updateStatus])

  useInterval(updateStatus, 1000)

  if (showText) {
    return (
      <DurationDisplay
        startTime={startTime}
        endTime={baseTime}
        title="duration"
      />
    )
  }

  return (
    <div
      className={cn(
        'text-error text-body2_m_14 inline-flex gap-1 whitespace-nowrap',
        textStyle
      )}
    >
      {showIcon && <Image src={clockIcon} alt="calendar" width={14} />}
      {target && showTarget && capitalizeFirstLetter(target)}
      {target && showTarget ? ' submission ' : 'Submission '}
      {isFinished ? 'has ended' : 'ends in'}
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
