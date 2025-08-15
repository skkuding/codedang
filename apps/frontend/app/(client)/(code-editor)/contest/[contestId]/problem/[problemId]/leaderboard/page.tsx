import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  LeaderboardPaginatedTable,
  LeaderboardPaginatedTableFallback
} from './_components/LeaderboardPaginatedTable'

export default async function LeaderboardPage(props: {
  params: Promise<{ problemId: string; contestId: string }>
}) {
  const { contestId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<LeaderboardPaginatedTableFallback />}>
        <LeaderboardPaginatedTable contestId={Number(contestId)} />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
