'use client'

import { cn } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import clockRedIcon from '@/public/icons/clock_red.svg'
import subtractIcon from '@/public/icons/subtract.svg'
import type { ContestStatus } from '@/types/type'
import { useTranslate } from '@tolgee/react'
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
  >(contest.status)
  const formattedTime = (t: Date) => dateFormatter(t, 'YYYY-MM-DD HH:mm')

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

  const colorMap = (state: string | undefined) => {
    if (state === 'ONGOING') {
      return 'text-primary bg-color-blue-95'
    } else if (state === 'ENDED') {
      return 'text-color-pink-50 bg-color-pink-95'
    } else if (state === 'UPCOMING') {
      return 'text-color-orange-50 bg-color-yellow-95'
    } else {
      return ''
    }
  }

  const registerDDayStatus = (() => {
    const registerDueTime = dayjs(contest.registerDueTime)
    const createTime = dayjs(contest.createTime)

    if (currentTime.isAfter(registerDueTime)) {
      return 'ENDED'
    }

    if (
      currentTime.isBefore(registerDueTime) &&
      currentTime.isAfter(createTime)
    ) {
      return 'ONGOING'
    }
  })()

  const contestDDayStatus = (() => {
    const startTime = dayjs(contest.startTime)
    const endTime = dayjs(contest.endTime)

    if (currentTime.isAfter(endTime)) {
      return 'ENDED'
    }

    if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
      return 'ONGOING'
    }

    if (currentTime.isBefore(startTime)) {
      return 'UPCOMING'
    }
  })()

  return (
    <div className="flex flex-col gap-[10px]">
      {!inContestEditor && (
        <div
          className={cn(
            'inline-flex h-6 w-[1208px] items-center whitespace-nowrap',
            textStyle
          )}
        >
          <Image src={subtractIcon} alt="subtract" width={20} height={20} />
          <p className="text-primary ml-[6px] mr-2 text-ellipsis whitespace-nowrap text-base font-medium leading-[22.4px] tracking-[-0.48px]">
            {t('registration')} :
          </p>
          <p className="text-color-neutral-30 mr-2 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal leading-[24px] tracking-[-0.48px]">
            {`${formattedTime(contest.createTime)} ~ ${formattedTime(contest.registerDueTime)}`}
          </p>
          {/* </p> */}
          <div
            className={cn(
              'flex h-7 w-[80px] items-center justify-center text-ellipsis whitespace-nowrap rounded-[4px] px-[10px] py-1 text-sm font-medium leading-[19.6px] tracking-[-0.42px]',
              colorMap(registerDDayStatus)
            )}
          >
            {registerDDayStatus}
          </div>
        </div>
      )}
      {!inContestEditor && (
        <div
          className={cn(
            'inline-flex h-6 w-[1208px] items-center whitespace-nowrap',
            textStyle
          )}
        >
          <Image src={clockRedIcon} alt="clock" width={20} height={20} />
          <p className="text-color-red-50 ml-[6px] mr-2 text-ellipsis whitespace-nowrap text-base font-medium leading-[22.4px] tracking-[-0.48px]">
            {t('duration')} :
          </p>
          <p className="text-color-neutral-30 mr-2 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal leading-[24px] tracking-[-0.48px]">
            {`${formattedTime(contest.startTime)} ~ ${formattedTime(contest.endTime)}`}
          </p>
          <div
            className={cn(
              'flex h-7 w-[80px] items-center justify-center text-ellipsis whitespace-nowrap rounded-[4px] px-[10px] py-1 text-sm font-medium leading-[19.6px] tracking-[-0.42px]',
              colorMap(contestDDayStatus)
            )}
          >
            {contestDDayStatus}
          </div>
        </div>
      )}
    </div>
  )
}
