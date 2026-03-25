'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { useParams } from 'next/navigation'
import { NoticeList } from '../_components/NoticeList'

export default function NoticePage() {
  const params = useParams()
  const courseId = Number(params.courseId)

  return (
    <div className="mt-20 flex flex-col gap-6 px-10">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <NoticeList courseId={courseId} />
      </ErrorBoundary>
    </div>
  )
}
