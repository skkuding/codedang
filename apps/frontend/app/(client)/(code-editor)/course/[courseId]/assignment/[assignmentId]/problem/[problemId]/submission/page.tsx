import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default async function SubmissionPage(props: {
  params: Promise<{ courseId: string; assignmentId: string; problemId: string }>
}) {
  const { courseId, assignmentId, problemId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable
          courseId={Number(courseId)}
          assignmentId={Number(assignmentId)}
          problemId={Number(problemId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
