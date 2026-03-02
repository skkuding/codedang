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

const TERM_ORDER = {
  spring: 1,
  summer: 2,
  fall: 3,
  winter: 4
} as const

const getCourseRank = (semester: string) => {
  const [yearText, termText] = semester.trim().split(/\s+/)
  const year = Number(yearText)
  const term = TERM_ORDER[termText.toLowerCase() as keyof typeof TERM_ORDER]

  return year * 10 + term
}

const getCurrentRank = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  let term: (typeof TERM_ORDER)[keyof typeof TERM_ORDER]

  if (month <= 2) {
    term = TERM_ORDER.winter
  } else if (month <= 6) {
    term = TERM_ORDER.spring
  } else if (month <= 8) {
    term = TERM_ORDER.summer
  } else {
    term = TERM_ORDER.fall
  }

  return year * 10 + term
}

const isPastCourse = (semester: string) => {
  return getCourseRank(semester) < getCurrentRank()
}

export function CourseCard({ course }: CourseCardProps) {
  const pastCourse = isPastCourse(course.courseInfo.semester)

  return (
    <div
      className={`mt-3 flex h-[200px] flex-col justify-between overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(53,78,116,0.1)] ${
        pastCourse ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div className="flex w-full flex-col justify-between gap-2 px-5 pt-4">
        <StatusBadge variant={'ongoing'} />
        <div className="h-[62px] text-ellipsis whitespace-pre-wrap text-xl font-medium leading-tight tracking-[-0.72px] md:text-2xl">
          [{course.courseInfo.courseNum}_{course.courseInfo.classNum}]{' '}
          <br className="md:hidden" />
          {course.groupName}
        </div>
        <div className="flex flex-col gap-[6px] pb-8 pt-4">
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <Image src={calendarIcon} alt="calendar" width={16} height={16} />
            <span className="text-sm font-medium tracking-[-0.42px] text-[#8A8A8A]">
              {course.courseInfo.semester}
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
              Prof. {course.courseInfo.professor}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
