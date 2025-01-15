import FetchErrorFallback from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default function Submission({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable problemId={Number(problemId)} />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
