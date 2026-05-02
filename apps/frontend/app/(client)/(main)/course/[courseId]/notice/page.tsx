'use client'

import { Suspense } from '@suspensive/react'
import { useParams } from 'next/navigation'
import { CourseNoticeTable } from '../_components/CourseNoticeTable'

export default function Notice() {
  const params = useParams()
  const courseId = Number(params.courseId)

  return (
    <div className="mb-12 mt-20 w-full px-10 lg:mt-20">
      <Suspense>
        <CourseNoticeTable courseId={courseId} />
      </Suspense>
    </div>
  )
}
