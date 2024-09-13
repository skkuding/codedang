'use client'

import { cn } from '@/lib/utils'
import ClockIcon from '@/public/20_clock.svg'
import type { Contest } from '@/types/type'
import type { ContestStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

export default function ContestStatusTimeDiff({
  contest,
  textStyle,
  inContestEditor
}: {
  contest: Contest
  textStyle: string
  inContestEditor: boolean
}) {
  const router = useRouter()
  const [contestStatus, setContestStatus] = useState<
    ContestStatus | undefined | null
  >(contest.status)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateContestStatus = () => {
    const now = dayjs()
    if (now.isAfter(contest.endTime)) {
      setContestStatus('finished')
    } else if (now.isAfter(contest.startTime)) {
      setContestStatus('ongoing')
    } else {
      setContestStatus('upcoming')
    }

    const timeRef =
      contestStatus === 'ongoing' || contestStatus === 'registeredOngoing'
        ? contest.endTime
        : contest.startTime

    const diff = dayjs.duration(Math.abs(dayjs(timeRef).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const hours_str = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minutes_str = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const seconds_str = seconds.toString().padStart(2, '0')

    if (inContestEditor) {
      if (days === 0 && hours === 0 && minutes === 5 && seconds === 0) {
        toast.error('Contest ends in 5 minutes.', { duration: 10000 })
      }
      if (days === 0 && hours === 0 && minutes === 1 && seconds === 0) {
        toast.error('Contest ends in 1 minute.', { duration: 10000 })
      }
    }

    setTimeDiff({
      days,
      hours: hours_str,
      minutes: minutes_str,
      seconds: seconds_str
    })
  }

  useEffect(() => {
    updateContestStatus()
  }, [])

  useInterval(() => {
    updateContestStatus()
  }, 1000)

  if (inContestEditor && contestStatus === 'finished') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 font-mono backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">The contest has finished!</h1>
          <p className="mb-4">Click the button below to exit the page.</p>
          <p className="mb-4">
            The scoring results may not be released immediately.
          </p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => {
              router.push(`/contest/${contest.id}` as Route)
            }}
          >
            Exit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap opacity-80',
        textStyle
      )}
    >
      {contestStatus === 'finished' ? (
        <>
          <Image src={ClockIcon} alt="Clock" />
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
          <Image src={ClockIcon} alt="Clock" />
          {contestStatus === 'ongoing' || contestStatus === 'registeredOngoing'
            ? 'Ends in'
            : 'Starts in'}
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
