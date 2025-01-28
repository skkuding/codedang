'use client'

import { cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock.svg'
import type { Course } from '@/types/type'
import type { CourseStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

interface CourseStatusTimeDiffProps {
  course: Course
  textStyle: string
  inCourseEditor: boolean
}
export function CourseStatusTimeDiff({
  //이름만 Course로 바꿈.
  course,
  textStyle,
  inCourseEditor
}: CourseStatusTimeDiffProps) {
  const router = useRouter()
  const { problemId } = useParams()

  const [courseStatus, setCourseStatus] = useState<
    CourseStatus | undefined | null
  >(course.status)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateCourseStatus = () => {
    const now = dayjs()

    const timeRef = 'ongoing'

    const diff = dayjs.duration(Math.abs(dayjs(timeRef).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const hourStr = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minuteStr = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const secondStr = seconds.toString().padStart(2, '0')

    if (inCourseEditor) {
      if (days === 0 && hours === 0 && minutes === 5 && seconds === 0) {
        toast.error('Course ends in 5 minutes.', { duration: 10000 })
      }
      if (days === 0 && hours === 0 && minutes === 1 && seconds === 0) {
        toast.error('Course ends in 1 minute.', { duration: 10000 })
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
    updateCourseStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    updateCourseStatus()
  }, 1000)
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap opacity-80',
        textStyle
      )}
    >
      {courseStatus === 'finished' ? (
        <>
          <Image src={clockIcon} alt="Clock" />
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
          <Image src={clockIcon} alt="Clock" />
          {courseStatus === 'ongoing' ? 'Ends in' : 'Starts in'}
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
