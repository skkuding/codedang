'use client'

import { cn } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import personFillIcon from '@/public/icons/person-fill.svg'
import type { JoinedCourse } from '@/types/type'
import Image from 'next/image'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

interface MobileCourseCardProps {
  course: JoinedCourse
  color?: string
}

export function MobileCourseCard({
  course,
  color = 'bg-neutral-100'
}: MobileCourseCardProps) {
  return (
    <div className="flex h-[150px] w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)] transition active:scale-95">
      <div
        className={cn(
          'h-5 w-full shrink-0 self-stretch rounded-t-[10px]',
          color
        )}
      />

      <div className="flex flex-1 flex-col gap-1 px-[10px] pb-[10px] pt-3">
        <div className="flex items-center">
          <StatusBadge variant={'ongoing'} />
        </div>

        <div className="flex min-h-[74px] shrink-0 flex-col justify-start gap-0 self-stretch">
          <span className="leading-tigh text-[15px] font-medium">
            [{course?.courseInfo?.courseNum}_{course?.courseInfo?.classNum}]
          </span>

          <span className="line-clamp-2 text-[15px] font-medium leading-tight">
            {course.groupName}
          </span>

          <div className="inline-flex items-center gap-[5px] whitespace-nowrap">
            <Image src={calendarIcon} alt="calendar" width={12} height={12} />
            <p className="text-color-neutral-30 my-1 text-[11px] font-normal leading-[140%] tracking-[-0.42px]">
              {course?.courseInfo?.semester}
            </p>
          </div>

          <div className="inline-flex items-center gap-[5px] whitespace-nowrap">
            <Image
              src={personFillIcon}
              alt="person-fill"
              width={14}
              height={14}
            />
            <p className="text-color-neutral-30 text-[11px] font-normal leading-[140%] tracking-[-0.42px]">
              Prof. {course?.courseInfo?.professor}{' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
