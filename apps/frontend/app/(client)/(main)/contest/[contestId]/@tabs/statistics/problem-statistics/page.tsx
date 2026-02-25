import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { ProblemStatisticsPage } from '../_components/ProblemStatistics'
import { ProblemStatisticsSkeletonWithSidebar } from '../_components/StatisticsSkeletons'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ProblemStatisticsSkeletonWithSidebar />}>
        <ProblemStatisticsPage />
      </Suspense>
    </ErrorBoundary>
  )
}
