'use client'

import CalendarGrayIcon from '@/public/icons/calendar-gray.svg'
import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { JoinedCourse } from '@/types/type'

interface CourseCardProps {
  course: JoinedCourse
  index: number
}

// 각 학기가 '활성'으로 보이는 마지막 월 (그 다음 달부터 회색처리)
// 봄: 6월까지 / 여름: 7월까지 / 가을: 12월까지 / 겨울: (다음해) 1월까지
const SEASON_END = {
  spring: { yearOffset: 0, lastMonth: 6 },
  summer: { yearOffset: 0, lastMonth: 7 },
  fall: { yearOffset: 0, lastMonth: 12 },
  winter: { yearOffset: 1, lastMonth: 1 }
} as const

const isPastCourse = (semester: string) => {
  const [yearText, termText] = semester.trim().split(/\s+/)
  const year = Number(yearText)
  const end = SEASON_END[termText?.toLowerCase() as keyof typeof SEASON_END]

  // 포맷이 예상과 다르면(연도 NaN, 알 수 없는 학기) 회색처리하지 않음
  if (!end || Number.isNaN(year)) {
    return false
  }

  const now = new Date()
  const nowMarker = now.getFullYear() * 12 + (now.getMonth() + 1)
  const endMarker = (year + end.yearOffset) * 12 + end.lastMonth

  return nowMarker > endMarker
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
            <CalendarGrayIcon width={24} height={24} />
            <span className="text-color-cool-neutral-40 text-body3_r_16">
              {course.courseInfo.semester}
            </span>
          </div>
          <div className="inline-flex items-center gap-[14px] whitespace-nowrap">
            <PersonFillIcon className="text-color-cool-neutral-60 h-6" />
            <span className="text-color-cool-neutral-40 text-body3_r_16">
              Prof. {course.courseInfo.professor}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
