'use client'

import { UNLIMITED_DATE } from '@/libs/constants'
import { cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import type { Assignment } from '@/types/type'
import type { AssignmentStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import type { Route } from 'next'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)
interface AssignmentStatusTimeDiffProps {
  assignment: Assignment
  textStyle: string
  inAssignmentEditor: boolean
}

export function AssignmentStatusTimeDiff({
  assignment,
  textStyle,
  inAssignmentEditor
}: AssignmentStatusTimeDiffProps) {
  const router = useRouter()
  const { problemId, courseId } = useParams()

  const [assignmentStatus, setAssignmentStatus] = useState<
    AssignmentStatus | undefined | null
  >(assignment.status)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateAssignmentStatus = () => {
    const now = dayjs()
    if (now.isAfter(assignment.dueTime)) {
      setAssignmentStatus('finished')
    } else if (now.isAfter(assignment.startTime)) {
      setAssignmentStatus('ongoing')
    } else {
      setAssignmentStatus('upcoming')
    }

    const timeRef =
      assignmentStatus === 'ongoing' ? assignment.dueTime : assignment.startTime

    const diff = dayjs.duration(Math.abs(dayjs(timeRef).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const hourStr = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minuteStr = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const secondStr = seconds.toString().padStart(2, '0')

    if (inAssignmentEditor) {
      if (days === 0 && hours === 0 && minutes === 5 && seconds === 0) {
        toast.error('Assignment ends in 5 minutes.', { duration: 10000 })
      }
      if (days === 0 && hours === 0 && minutes === 1 && seconds === 0) {
        toast.error('Assignment ends in 1 minute.', { duration: 10000 })
      }
    }

    setTimeDiff({
      days,
      hours: hourStr,
      minutes: minuteStr,
      seconds: secondStr
    })
  }

  useEffect(() => {
    updateAssignmentStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    updateAssignmentStatus()
  }, 1000)

  if (inAssignmentEditor && assignmentStatus === 'finished') {
    router.push(
      `/course/${courseId}/assignment/${assignment.id}/finished/problem/${problemId}` as Route
    )
  }

  if (dayjs(assignment.dueTime).isSame(dayjs(UNLIMITED_DATE))) {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap opacity-80',
        textStyle
      )}
    >
      {assignmentStatus === 'finished' ? (
        <>
          <Image src={clockIcon} alt="clock" width={16} height={16} />
          Finished
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {timeDiff.days > 0
              ? `${timeDiff.days} DAYS`
              : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
          </p>
          ago
        </>
      ) : (
        <>
          <Image src={clockIcon} alt="clock" width={16} height={16} />
          {assignmentStatus === 'ongoing' ? 'Ends in' : 'Starts in'}
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {timeDiff.days > 0
              ? `${timeDiff.days} DAYS`
              : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
          </p>
        </>
      )}
    </div>
  )
}
