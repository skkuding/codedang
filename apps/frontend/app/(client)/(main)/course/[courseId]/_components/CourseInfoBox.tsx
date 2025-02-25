'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import calendarFillIcon from '@/public/icons/calendar-fill.svg'
import ongoingIcon from '@/public/icons/ongoing.svg'
import personFillIcon from '@/public/icons/person-fill.svg'
import type { Course } from '@/types/type'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface CourseInfoBoxProps {
  courseId: string
}

export function CourseInfoBox({ courseId }: CourseInfoBoxProps) {
  const [course, setCourse] = useState<Course>()
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res: Course = await safeFetcherWithAuth
          .get(`course/${courseId}`)
          .json()
        setCourse(res)
      } catch {
        console.error('Failed to fetch course')
      }
    }
    fetchCourse()
  }, [courseId])

  return (
    <div className="flex flex-col gap-3 px-2 pt-24">
      <div className="flex gap-1">
        <Image src={ongoingIcon} alt="calendar-fill" width={20} height={20} />
        {/* FIXME: 하드코딩된 ONGOING 대신 데이터를 받아와주세요 */}
        <p className="text-primary">{course && 'ONGOING'}</p>
      </div>
      <p className="line-clamp-2 w-56 break-words text-base font-semibold">
        {course
          ? `[${course.courseInfo.courseNum}_${course.courseInfo.classNum}] ${course.groupName}`
          : ''}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Image
            src={calendarFillIcon}
            alt="calendar-fill"
            width={16}
            height={16}
          />
          <p className="font-medium text-neutral-600">
            {course ? course.courseInfo.semester : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Image
            src={personFillIcon}
            alt="person-fill"
            width={16}
            height={16}
          />
          <p className="font-medium text-neutral-600">
            {course ? `${course.courseInfo.professor} 교수` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
