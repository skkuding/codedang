import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { RealtimeLearBoardPage } from './_components/RealtimeLeaderBoard'
import { RealtimeLearBoardSkeleton } from './_components/StatisticsSkeletons'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<RealtimeLearBoardSkeleton />}>
        <RealtimeLearBoardPage />
      </Suspense>
    </ErrorBoundary>
  )
}
