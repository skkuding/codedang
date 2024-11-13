'use client'

import { cn, fetcher } from '@/lib/utils'
import ClockIcon from '@/public/icons/clock.svg'
import ExitIcon from '@/public/icons/exit.svg'
import VisitIcon from '@/public/icons/visit.svg'
import type { Contest } from '@/types/type'
import type { ContestStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import type { Route } from 'next'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'
import { Button } from './ui/button'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    updateContestStatus()
  }, 1000)

  const [isProblemPubliclyAvailable, setIsProblemAvailable] = useState<
    boolean | null
  >(null)

  useEffect(() => {
    const checkProblemAvailability = async () => {
      try {
        const response = await fetcher.head(`problem/${problemId}`)
        if (response.status !== 404) {
          setIsProblemAvailable(true)
        } else {
          setIsProblemAvailable(false)
        }
      } catch (error) {
        setIsProblemAvailable(false)
      }
    }

    if (inContestEditor && contestStatus === 'finished') {
      checkProblemAvailability()
    }
  }, [inContestEditor, contestStatus, problemId])

  if (inContestEditor && contestStatus === 'finished') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-8 font-mono text-2xl">The contest has finished!</h1>
          {isProblemPubliclyAvailable ? (
            <>
              <p className="mb-2 font-sans font-light">
                You can solve the public problem regardless of scoring,
              </p>
              <p className="mb-10 font-sans font-light">
                or click the exit button below to exit the page.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 font-sans font-light">
                This problem is now unavailable to students.
              </p>
              <p className="mb-10 font-sans font-light">
                Click the button below to exit the page.
              </p>
            </>
          )}
          {isProblemPubliclyAvailable && (
            <Button
              size="icon"
              onClick={() => {
                router.push(`/problem/${problemId}` as Route)
              }}
              className="h-10 w-48 shrink-0 gap-[5px] rounded-[4px] border border-blue-500 bg-blue-100 font-sans text-blue-500 hover:bg-blue-300"
            >
              <Image src={VisitIcon} alt="exit" width={20} height={20} />
              Visit Public Problem
            </Button>
          )}
          <Button
            size="icon"
            onClick={() => {
              router.push(`/contest/${contest.id}` as Route)
            }}
            className="ml-4 h-10 w-24 shrink-0 gap-[5px] rounded-[4px] bg-blue-500 font-sans hover:bg-blue-700"
          >
            <Image src={ExitIcon} alt="exit" width={20} height={20} />
            Exit
          </Button>
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
