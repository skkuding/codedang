'use client'

import { cn } from '@/libs/utils'
import clockIcon from '@/public/icons/clock_blue.svg'
import emergencyIcon from '@/public/icons/emergency.svg'
import type { ContestStatus } from '@/types/type'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

interface ContestStatusTimeDifftype {
  id: number
  status: ContestStatus
  startTime: Date
  endTime: Date
  registerDueTime: Date
}

export function ContestStatusTimeDiff({
  contest,
  textStyle,
  inContestEditor
}: {
  contest: ContestStatusTimeDifftype
  textStyle: string
  inContestEditor: boolean
}) {
  const router = useRouter()
  const { problemId } = useParams()
  const now = dayjs()

  const [contestStatus, setContestStatus] = useState<
    ContestStatus | undefined | null
  >(contest.status)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const [registerTimeDiff, setRegisterTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateContestStatus = () => {
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

    const registerTimeRef = contest.registerDueTime
    const registerDiff = dayjs.duration(
      Math.abs(dayjs(registerTimeRef).diff(now))
    )
    const registerDays = Math.floor(registerDiff.asDays())
    const registerHours = Math.floor(registerDiff.asHours() % 24)
    const registerHoursStr = registerHours.toString().padStart(2, '0')
    const registerMinutes = Math.floor(registerDiff.asMinutes() % 60)
    const registerMinutesStr = registerMinutes.toString().padStart(2, '0')
    const registerSeconds = Math.floor(registerDiff.asSeconds() % 60)
    const registerSecondsStr = registerSeconds.toString().padStart(2, '0')

    if (inContestEditor) {
      if (days === 0 && hours === 0 && minutes === 5 && seconds === 0) {
        toast.error('Contest ends in 5 minutes.', { duration: 10000 })
      }
      if (days === 0 && hours === 0 && minutes === 1 && seconds === 0) {
        toast.error('Contest ends in 1 minute.', { duration: 10000 })
      }
    }

    if (inContestEditor) {
      if (
        registerDays === 0 &&
        registerHours === 0 &&
        registerMinutes === 5 &&
        registerSeconds === 0
      ) {
        toast.error('Contest registration will close in 5 minutes.', {
          duration: 10000
        })
      }
      if (
        registerDays === 0 &&
        registerHours === 0 &&
        registerMinutes === 1 &&
        registerSeconds === 0
      ) {
        toast.error('Contest registration will close in 1 minutes.', {
          duration: 10000
        })
      }
    }

    setTimeDiff({
      days,
      hours: hoursStr,
      minutes: minutesStr,
      seconds: secondsStr
    })

    setRegisterTimeDiff({
      days,
      hours: registerHoursStr,
      minutes: registerMinutesStr,
      seconds: registerSecondsStr
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
    <div className="flex flex-col gap-[10px]">
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
            {contestStatus === 'ongoing' ||
            contestStatus === 'registeredOngoing'
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
      {!inContestEditor && (
        <div
          className={cn(
            'inline-flex items-center gap-2 whitespace-nowrap text-base tracking-[-0.48px] text-[#333333e6] opacity-80',
            textStyle
          )}
        >
          <Image src={emergencyIcon} alt="emergency" width={20} height={20} />
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {now.isBefore(contest.registerDueTime)
              ? `Join within ${registerTimeDiff.hours}:${registerTimeDiff.minutes}:${registerTimeDiff.seconds}`
              : `Registration is closed !`}
          </p>
        </div>
      )}
    </div>
  )
}
