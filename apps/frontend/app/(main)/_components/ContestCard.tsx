'use client'

import { cn, dateFormatter } from '@/lib/utils'
import type { Contest } from '@/types/type'
import ProgressBar from 'react-customizable-progressbar'
import {
  FaForward,
  FaPlayCircle,
  FaRegCalendarCheck,
  FaRegClock
} from 'react-icons/fa'
import { FaRegCalendarAlt } from 'react-icons/fa'
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
          {contest.status.endsWith('going') ? <FaPlayCircle /> : <FaForward />}
          <p>
            {contest.status.startsWith('registered')
              ? 'registered'
              : contest.status}
          </p>
        </div>
        <div className="line-clamp-2 h-11 whitespace-pre-wrap text-lg font-semibold leading-tight text-black">
          {contest.title}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            <FaRegCalendarCheck />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">
              {startTime} ~ {endTime}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            {contest.status === 'finished' ? (
              <>
                <FaRegCalendarAlt />
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {startTime} - {endTime}
                </p>
              </>
            ) : (
              <>
                <FaRegClock />
                {contest.status === 'ongoing' ? 'Ends in' : 'Starts in'}
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  <TimeDiff timeRef={contest.endTime}></TimeDiff>
                </p>
              </>
            )}
          </div>
        </div>
        <div>
          <ProgressBar
            className="-mr-4"
            radius={22}
            progress={40}
            steps={100}
            trackStrokeWidth={4}
            strokeWidth={5}
            counterClockwise={true}
            strokeColor="#afeabc"
            trackStrokeColor="#ebfaef"
            strokeLinecap="square"
          >
            <p className="absolute bottom-1/2 right-1/2 line-clamp-2 w-1/2 translate-x-1/2 translate-y-1/2 text-center text-xs text-black">
              40 / 100
            </p>
          </ProgressBar>
        </div>
      </div>
    </div>
  )
}
