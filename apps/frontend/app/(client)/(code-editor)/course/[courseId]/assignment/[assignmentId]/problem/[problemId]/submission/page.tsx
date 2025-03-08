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
  params: { problemId: string; assignmentId: string }
}) {
  const { assignmentId, problemId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable
          assignmentId={Number(assignmentId)}
          problemId={Number(problemId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
