'use client'

import { cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock_blue.svg'
import type { Contest } from '@/types/type'
import type { ContestStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

export function ContestStatusTimeDiff({
  contest,
  textStyle,
  inContestEditor
}: {
  contest: Contest
  textStyle: string
  inContestEditor: boolean
}) {
  const router = useRouter()
  const { problemId } = useParams()

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
    const hoursStr = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minutesStr = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const secondsStr = seconds.toString().padStart(2, '0')

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
      hours: hoursStr,
      minutes: minutesStr,
      seconds: secondsStr
    })
  }

  useEffect(() => {
    updateContestStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    updateContestStatus()
  }, 1000)

  if (inContestEditor && contestStatus === 'finished') {
    router.push(`/contest/${contest.id}/finished/problem/${problemId}`)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap text-base tracking-[-0.48px] text-[#333333e6] opacity-80',
        textStyle
      )}
    >
      {contestStatus === 'finished' ? (
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
          <Image src={clockIcon} alt="clock" width={20} height={20} />
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
