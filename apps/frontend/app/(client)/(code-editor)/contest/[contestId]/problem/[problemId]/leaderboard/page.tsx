import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  LeaderboardPaginatedTable,
  LeaderboardPaginatedTableFallback
} from './_components/LeaderboardPaginatedTable'

export default function LeaderboardPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { contestId } = params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<LeaderboardPaginatedTableFallback />}>
        <LeaderboardPaginatedTable contestId={Number(contestId)} />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
