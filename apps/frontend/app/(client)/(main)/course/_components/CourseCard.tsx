'use client'

import { cn } from '@/libs/utils'
import calendarFillIcon from '@/public/icons/calendar-fill.svg'
import personFillIcon from '@/public/icons/person-fill.svg'
import type { JoinedCourse } from '@/types/type'
import Image from 'next/image'
import 'react-circular-progressbar/dist/styles.css'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

interface CourseCardProps {
  course: JoinedCourse
  color: string
  index: number
}

export function CourseCard({ course, color }: CourseCardProps) {
  return (
    <div className="flex h-[300px] w-[310px] flex-col justify-between rounded-lg border border-gray-200 shadow-none">
      <div className={cn('h-[108px] rounded-t-lg', color)} />
      <div className="flex h-[192px] w-full flex-col justify-between px-6 py-6">
        <StatusBadge variant={'ongoing'} />
        <div className="my-1 line-clamp-1 h-6 w-[347px] text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight text-black">
          [{course?.courseInfo?.courseNum}-{course?.courseInfo?.classNum}]{' '}
          {course.groupName}
        </div>
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800">
            <Image src={calendarFillIcon} alt="calendar-fill" />
            <p className="my-2 text-sm font-medium text-neutral-600">
              {course?.courseInfo?.semester}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800">
            <Image src={personFillIcon} alt="person-fill" />
            <p className="text-sm font-medium text-neutral-600">
              Prof. {course?.courseInfo?.professor}{' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
