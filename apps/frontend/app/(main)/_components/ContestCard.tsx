'use client'

import { cn, dateFormatter } from '@/lib/utils'
import CalendarIcon from '@/public/20_calendar.svg'
import ClockIcon from '@/public/20_clock.svg'
import OngoingIcon from '@/public/20_ongoing.svg'
import UpcomingIcon from '@/public/20_upcoming.svg'
import type { Contest } from '@/types/type'
import Image from 'next/image'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import TimeDiff from './TimeDiff'

const bgVariants = {
  ongoing: 'bg-gradient-to-b from-blue-100 to-white',
  upcoming: 'bg-white',
  finished: 'bg-gray-500',
  registeredOngoing: 'bg-gradient-to-b from-blue-100 to-white',
  registeredUpcoming: 'bg-white'
}

const txtVariants = {
  ongoing: 'text-blue-500',
  upcoming: 'text-red-400',
  finished: 'text-gray-500',
  registeredOngoing: 'text-blue-500',
  registeredUpcoming: 'text-red-400'
}
interface Props {
  contest: Contest
}

export default function ContestCard({ contest }: Props) {
  const startTime = dateFormatter(contest.startTime, 'YYYY-MM-DD')
  const endTime = dateFormatter(contest.endTime, 'YYYY-MM-DD')

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between gap-1 rounded-md border border-gray-200 px-3 shadow-none transition hover:scale-105 hover:opacity-80',
        bgVariants[contest.status]
      )}
    >
      <div
        className={cn(
          'flex flex-col justify-between gap-4 pt-4 uppercase',
          txtVariants[contest.status]
        )}
      >
        <div className="inline-flex items-center gap-2">
          {contest.status.endsWith('going') ? (
            <Image src={OngoingIcon} alt="Ongoing" />
          ) : (
            <Image src={UpcomingIcon} alt="Upcoming" />
          )}
          <p>
            {contest.status.startsWith('registered')
              ? 'registered'
              : contest.status}
          </p>
        </div>
        <div className="line-clamp-2 h-14 whitespace-pre-wrap text-lg font-semibold leading-tight text-black">
          {contest.title}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            <Image src={CalendarIcon} alt="Calendar" />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">
              {startTime} ~ {endTime}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            {contest.status === 'finished' ? (
              <>
                <Image src={CalendarIcon} alt="Calendar" />
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {startTime} - {endTime}
                </p>
              </>
            ) : (
              <>
                <Image src={ClockIcon} alt="Clock" />
                {contest.status === 'ongoing' ? 'Ends in' : 'Starts in'}
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  <TimeDiff timeRef={contest.endTime}></TimeDiff>
                </p>
              </>
            )}
          </div>
        </div>
        {(contest.status == 'ongoing' ||
          contest.status == 'registeredOngoing') && (
          <div className="h-12 w-12">
            <CircularProgressbar value={60} text={`60%`} />
          </div>
        )}
      </div>
    </div>
  )
}
