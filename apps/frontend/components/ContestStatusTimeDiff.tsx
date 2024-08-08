'use client'

import TimeDiff from '@/app/(main)/_components/TimeDiff'
import { cn } from '@/lib/utils'
import ClockIcon from '@/public/20_clock.svg'
import type { Contest } from '@/types/type'
import { ContestStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'

dayjs.extend(duration)

export default function ContestStatusTimeDiff({
  contest,
  textStyle
}: {
  contest: Contest
  textStyle: string
}) {
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
    const hours = Math.floor(diff.asHours()).toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
      .toString()
      .padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
      .toString()
      .padStart(2, '0')

    setTimeDiff({ days, hours, minutes, seconds })
  }

  useEffect(() => {
    updateContestStatus()
  }, [])

  useInterval(() => {
    updateContestStatus()
  }, 1000)

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
            <TimeDiff timeRef={contest.endTime}></TimeDiff>
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
