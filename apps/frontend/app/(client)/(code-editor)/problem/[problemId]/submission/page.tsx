import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default async function Submission(props: {
  params: Promise<{ problemId: string }>
}) {
  const { problemId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable problemId={Number(problemId)} />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
