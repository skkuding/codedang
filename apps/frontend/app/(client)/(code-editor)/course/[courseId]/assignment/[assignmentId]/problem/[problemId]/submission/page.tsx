import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default function SubmissionPage({
  params
}: {
  params: { problemId: string; courseId: string; assignmentId: string }
}) {
  const { problemId, courseId, assignmentId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable
          problemId={Number(problemId)}
          courseId={Number(courseId)}
          assignmentId={Number(assignmentId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
