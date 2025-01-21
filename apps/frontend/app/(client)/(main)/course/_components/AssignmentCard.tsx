'use client'

import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { cn, dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Assignment } from '@/types/type'
import Image from 'next/image'
import 'react-circular-progressbar/dist/styles.css'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

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
  assignment: Assignment
}

export function AssignmentCard({ assignment }: Props) {
  const startTime = dateFormatter(assignment.startTime, 'YYYY-MM-DD')
  const endTime = dateFormatter(assignment.endTime, 'YYYY-MM-DD')

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between gap-4 rounded-md border border-gray-200 px-3 shadow-none transition hover:scale-105 hover:opacity-80',
        bgVariants[assignment.status]
      )}
    >
      <div
        className={cn(
          'flex flex-col justify-between gap-4 pt-4 uppercase',
          txtVariants[assignment.status]
        )}
      >
        <StatusBadge variant={assignment.status} />
        <div className="line-clamp-4 text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight text-black min-[400px]:line-clamp-2">
          {assignment.title}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="line-clamp-2 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            <Image src={calendarIcon} alt="Calendar" />
            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
              {startTime} ~ {endTime}
            </p>
          </div>
          <AssignmentStatusTimeDiff
            assignment={assignment}
            textStyle="text-xs text-gray-800"
            inAssignmentEditor={false}
          />
        </div>
      </div>
    </div>
  )
}
