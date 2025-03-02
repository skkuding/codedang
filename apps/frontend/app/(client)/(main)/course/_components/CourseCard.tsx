'use client'

import { cn } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
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
          [{course?.courseInfo?.courseNum}_{course?.courseInfo?.classNum}]{' '}
          {course.groupName}
        </div>
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800">
            <Image src={calendarIcon} alt="calendar" width={16} height={16} />
            <p className="my-2 text-sm font-medium text-[#8A8A8A]">
              {course?.courseInfo?.semester}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800">
            <Image
              src={personFillIcon}
              alt="person-fill"
              width={16}
              height={16}
            />
            <p className="text-sm font-medium text-[#8A8A8A]">
              Prof. {course?.courseInfo?.professor}{' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
