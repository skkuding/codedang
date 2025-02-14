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
  const { problemId, contestId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <LeaderboardPaginatedTable
          problemId={Number(problemId)}
          contestId={Number(contestId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
