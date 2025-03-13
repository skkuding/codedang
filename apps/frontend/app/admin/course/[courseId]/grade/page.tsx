'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  GradeAssignmentTable,
  GradeAssignmentTableFallback
} from './_components/GradeAssignmentTable'

export default function Page() {
  const { courseId } = useParams() // 경로에서 params 가져오기
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Grade</h1>
      </div>
      <h1 className="text-lg font-normal text-gray-500">
        Here’s a list of all assignments available for grading or review
      </h1>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<GradeAssignmentTableFallback />}>
          <GradeAssignmentTable groupId={String(courseId)} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
