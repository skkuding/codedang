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
  size: 'lg' | 'sm'
  index: number
}

export function CourseCard({ course, color, size }: CourseCardProps) {
  const isDesktop = size === 'lg'
  /* desktop view */
  if (isDesktop) {
    return (
      <div className="flex h-[300px] w-[310px] flex-col justify-between overflow-hidden rounded-lg border border-gray-200 shadow-none">
        <div className={cn('h-[108px]', color)} />
        <div className="flex h-[192px] w-full flex-col justify-between gap-3 px-6 pb-8 pt-[26px]">
          <StatusBadge variant={'ongoing'} />
          <div className="text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight tracking-[-0.54px] text-black">
            [{course?.courseInfo?.courseNum}_{course?.courseInfo?.classNum}]{' '}
            {course.groupName}
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
              <Image src={calendarIcon} alt="calendar" width={16} height={16} />
              <p className="my-2 text-sm font-medium tracking-[-0.42px] text-[#8A8A8A]">
                {course?.courseInfo?.semester}
              </p>
            </div>
            <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
              <Image
                src={personFillIcon}
                alt="person-fill"
                width={16}
                height={16}
              />
              <p className="text-sm font-medium tracking-[-0.42px] text-[#8A8A8A]">
                Prof. {course?.courseInfo?.professor}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* Mobile view */
  return (
    <div className="flex h-[150px] w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)] transition active:scale-95">
      <div className={cn('h-5 w-full shrink-0 rounded-t-[10px]', color)} />

      <div className="flex flex-1 flex-col gap-1 px-[10px] pb-[10px] pt-3">
        <div className="mb-1 flex items-center">
          <StatusBadge variant={'ongoing'} />
        </div>

        <div className="flex min-h-[74px] shrink-0 flex-col justify-start gap-0 self-stretch">
          <span className="text-[15px] font-medium leading-[18.2px]">
            [{course?.courseInfo?.courseNum}_{course?.courseInfo?.classNum}]
          </span>

          <span className="line-clamp-2 text-[15px] font-medium leading-[18.2px] text-black">
            {course.groupName}
          </span>

          <div className="mt-1">
            <div className="inline-flex items-center gap-[5px] whitespace-nowrap">
              <Image src={calendarIcon} alt="calendar" width={12} height={12} />
              <p className="text-[11px] font-normal leading-[140%] tracking-[-0.42px] text-[#8A8A8A]">
                {course?.courseInfo?.semester}
              </p>
            </div>
            <div className="flex items-center gap-[5px] whitespace-nowrap">
              <Image
                src={personFillIcon}
                alt="person-fill"
                width={14}
                height={14}
              />
              <p className="text-[11px] font-normal leading-[140%] tracking-[-0.42px] text-[#8A8A8A]">
                Prof. {course?.courseInfo?.professor}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
