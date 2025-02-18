import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  LeaderboardPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/LeaderboardPaginatedTable'

export default function SubmissionPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { contestId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <LeaderboardPaginatedTable contestId={Number(contestId)} />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
