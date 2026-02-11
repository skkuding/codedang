'use client'

import calendarIcon from '@/public/icons/calendar-gray.svg'
import personFillIcon from '@/public/icons/person-gray.svg'
import type { JoinedCourse } from '@/types/type'
import Image from 'next/image'
import 'react-circular-progressbar/dist/styles.css'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

interface CourseCardProps {
  course: JoinedCourse
  index: number
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="mt-3 flex h-[200px] flex-col justify-between overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(53,78,116,0.1)]">
      {/* <div className={cn('h-[108px]', color)} /> */}
      <div className="flex w-full flex-col justify-between gap-2 px-5 pt-4">
        <StatusBadge variant={'ongoing'} />
        <div className="h-[62px] text-ellipsis whitespace-pre-wrap text-xl font-medium leading-tight tracking-[-0.72px] md:text-2xl">
          [{course?.courseInfo?.courseNum}_{course?.courseInfo?.classNum}]{' '}
          <br className="md:hidden" />
          {course.groupName}
        </div>
        <div className="flex flex-col gap-[6px] pb-8 pt-4">
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <Image src={calendarIcon} alt="calendar" width={16} height={16} />
            <span className="text-sm font-medium tracking-[-0.42px] text-[#8A8A8A]">
              {course?.courseInfo?.semester}
            </span>
          </div>
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <Image
              src={personFillIcon}
              alt="person-fill"
              width={16}
              height={16}
            />
            <span className="text-sm font-medium tracking-[-0.42px] text-[#8A8A8A]">
              Prof. {course?.courseInfo?.professor}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
