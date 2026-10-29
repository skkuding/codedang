'use client'

import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import { safeFetcherWithAuth } from '@/libs/utils'
import CourseCalendarIcon from '@/public/icons/course-calendar.svg'
import CourseStatusPlayIcon from '@/public/icons/course-status-play.svg'
import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { Course } from '@/types/type'
import { useEffect, useState } from 'react'

interface CourseInfoBoxProps {
  courseId: string
}

export function CourseInfoBox({ courseId }: CourseInfoBoxProps) {
  const [course, setCourse] = useState<Course>()
  const { setHeaderTitle } = useHeaderTitle()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res: Course = await safeFetcherWithAuth
          .get(`course/${courseId}`)
          .json()
        setCourse(res)

        // Course 이름을 Context에 설정
        const courseName = `[${res.courseInfo.courseNum}_${res.courseInfo.classNum}] ${res.groupName}`
        setHeaderTitle(courseName)
      } catch {
        console.error('Failed to fetch course')
      }
    }
    fetchCourse()
  }, [courseId, setHeaderTitle])

  return (
    <div className="after:bg-line-neutral relative flex h-[166px] w-full flex-col gap-4 pb-5 after:absolute after:inset-x-0 after:bottom-0 after:h-px">
      <div className="flex h-[84px] shrink-0 flex-col gap-1">
        <div className="flex h-[18px] shrink-0 items-center gap-1">
          <span className="bg-primary flex size-3.5 items-center justify-center rounded-full">
            <CourseStatusPlayIcon
              aria-hidden="true"
              className="size-[9.333px]"
            />
          </span>
          {/* FIXME: 하드코딩된 ONGOING 대신 데이터를 받아와주세요 */}
          <p className="text-caption3_r_13 text-primary">
            {course && 'ONGOING'}
          </p>
        </div>
        <p className="text-head6_m_24 line-clamp-2 h-[62px] break-words leading-[1.3] tracking-[-0.72px]">
          {course
            ? `[${course.courseInfo.courseNum}_${course.courseInfo.classNum}] ${course.groupName}`
            : ''}
        </p>
      </div>
      <div className="flex h-[46px] shrink-0 flex-col gap-1">
        <div className="flex h-[21px] items-center gap-2">
          <CourseCalendarIcon aria-hidden="true" className="size-4 shrink-0" />
          <p className="text-body2_m_14 text-color-neutral-40">
            {course ? course.courseInfo.semester : ''}
          </p>
        </div>
        <div className="flex h-[21px] items-center gap-2">
          <PersonFillIcon
            aria-hidden="true"
            className="text-primary size-4 shrink-0"
          />
          <p className="text-body2_m_14 text-color-neutral-40">
            {course ? `${course.courseInfo.professor} 교수` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
