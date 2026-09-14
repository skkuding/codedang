'use client'

import { Suspense } from '@suspensive/react'
import { useParams } from 'next/navigation'
import { QnAPostButton } from '../../../contest/[contestId]/@tabs/qna/_components/QnAPostButton'
import { CourseQnaTable } from '../_components/CourseQnaTable'

export default function QNA() {
  const params = useParams()
  const courseId = Number(params.courseId)
  return (
    <div className="mt-20 flex flex-col gap-6 px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="min-w-0 break-words text-2xl font-semibold leading-[33.6px] tracking-[-0.48px]">
          QUESTION & ANSWER
        </span>
        <div className="w-[120px] shrink-0">
          <QnAPostButton
            section="course"
            canCreateQnA={true}
            hrefId={courseId}
          />
        </div>
      </div>

      <Suspense>
        <CourseQnaTable courseId={courseId} />
      </Suspense>
    </div>
  )
}
