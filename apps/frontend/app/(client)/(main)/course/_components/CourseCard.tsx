'use client'

import calendarIcon from '@/public/icons/calendar-gray.svg'
import personFillIcon from '@/public/icons/person-gray.svg'
import type { JoinedCourse } from '@/types/type'
import Image from 'next/image'

interface CourseCardProps {
  course: JoinedCourse
  index: number
}

const TERM_ORDER = {
  spring: 0,
  summer: 1,
  fall: 2,
  winter: 3
} as const

const getCourseRank = (semester: string) => {
  const [yearText, termText] = semester.trim().split(/\s+/)
  const year = Number(yearText)
  const term = TERM_ORDER[termText.toLowerCase() as keyof typeof TERM_ORDER]

  return year * 10 + term
}

const getCurrentRank = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const month = now.getMonth() + 1

  let currentSeasonIdx = 0
  let baseYear = currentYear

  if (month >= 3 && month <= 5) {
    currentSeasonIdx = 0
  } else if (month >= 6 && month <= 8) {
    currentSeasonIdx = 1
  } else if (month >= 9 && month <= 11) {
    currentSeasonIdx = 2
  } else {
    if (month <= 2) {
      baseYear = baseYear - 1
    }
    currentSeasonIdx = 3
  }

  return baseYear * 10 + currentSeasonIdx
}

const isPastCourse = (semester: string) => {
  return getCourseRank(semester) < getCurrentRank()
}

export function CourseCard({ course }: CourseCardProps) {
  const pastCourse = isPastCourse(course.courseInfo.semester)

  return (
    <div
      className={`mt-3 flex h-[202px] flex-col justify-between overflow-hidden rounded-xl pb-2 shadow-[0_4px_20px_rgba(53,78,116,0.1)] ${
        pastCourse ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div className="flex w-full flex-col justify-between gap-2 px-5 pt-4">
        <span className="text-primary text-sub3_sb_16">
          [{course.courseInfo.courseNum}_{course.courseInfo.classNum}]{' '}
        </span>
        <div className="text-head6_m_24 line-clamp-2 h-[62px]">
          {course.groupName}
        </div>
        <div className="flex flex-col gap-[6px] pt-4">
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <Image src={calendarIcon} alt="calendar" width={24} height={24} />
            <span className="text-color-cool-neutral-40 text-body3_r_16">
              {course.courseInfo.semester}
            </span>
          </div>
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <Image
              src={personFillIcon}
              alt="person-fill"
              width={24}
              height={24}
            />
            <span className="text-color-cool-neutral-40 text-body3_r_16">
              Prof. {course.courseInfo.professor}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
