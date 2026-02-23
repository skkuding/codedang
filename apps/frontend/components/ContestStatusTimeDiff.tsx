'use client'

import { DurationDisplay } from '@/components/DurationDisplay'
import { cn } from '@/libs/utils'
import type { ContestStatus } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

dayjs.extend(duration)

interface ContestStatusTimeDifftype {
  id: number
  startTime: Date
  endTime: Date
  registerDueTime: Date
  createTime: Date
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
  const { t } = useTranslate()
  const router = useRouter()
  const { problemId } = useParams()
  const currentTime = dayjs()

  const [contestStatus, setContestStatus] = useState<
    ContestStatus | undefined | null
  >(undefined)

  const updateContestStatus = () => {
    if (currentTime.isAfter(contest.endTime)) {
      setContestStatus('finished')
    } else if (currentTime.isAfter(contest.startTime)) {
      setContestStatus('ongoing')
    } else {
      setContestStatus('upcoming')
    }

    const timeRef =
      contestStatus === 'ongoing' || contestStatus === 'registeredOngoing'
        ? contest.endTime
        : contest.startTime
    const diff = dayjs.duration(Math.abs(dayjs(timeRef).diff(currentTime)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const minutes = Math.floor(diff.asMinutes() % 60)
    const seconds = Math.floor(diff.asSeconds() % 60)

    const registerTimeRef = contest.registerDueTime
    const registerDiff = dayjs.duration(
      Math.abs(dayjs(registerTimeRef).diff(currentTime))
    )
    const registerDays = Math.floor(registerDiff.asDays())
    const registerHours = Math.floor(registerDiff.asHours() % 24)
    const registerMinutes = Math.floor(registerDiff.asMinutes() % 60)
    const registerSeconds = Math.floor(registerDiff.asSeconds() % 60)

    if (inContestEditor) {
      if (days === 0 && hours === 0 && minutes === 5 && seconds === 0) {
        toast.error(t('contest_ends_in_5_minutes'), { duration: 10000 })
      }
      if (days === 0 && hours === 0 && minutes === 1 && seconds === 0) {
        toast.error(t('contest_ends_in_1_minute'), { duration: 10000 })
      }
    }

    if (inContestEditor) {
      if (
        registerDays === 0 &&
        registerHours === 0 &&
        registerMinutes === 5 &&
        registerSeconds === 0
      ) {
        toast.error(t('contest_registration_5_minutes'), {
          duration: 10000
        })
      }
      if (
        registerDays === 0 &&
        registerHours === 0 &&
        registerMinutes === 1 &&
        registerSeconds === 0
      ) {
        toast.error(t('contest_registration_1_minute'), {
          duration: 10000
        })
      }
    }
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
      {!inContestEditor && (
        <div
          className={cn(
            'inline-flex h-6 w-[1208px] items-center whitespace-nowrap',
            textStyle
          )}
        >
          <DurationDisplay
            startTime={contest.createTime}
            endTime={contest.registerDueTime}
            title={t('registration_label')}
          />
        </div>
      )}
      {!inContestEditor && (
        <div
          className={cn(
            'inline-flex h-6 w-[1208px] items-center whitespace-nowrap',
            textStyle
          )}
        >
          <DurationDisplay
            startTime={contest.startTime}
            endTime={contest.endTime}
            title={t('duration_label')}
          />
        </div>
      )}
    </div>
  )
}
