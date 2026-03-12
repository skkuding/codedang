import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { UserAnalysisSkeletonWithSidebar } from '../_components/StatisticsSkeletons'
import { UserAnalysisPage } from '../_components/UserAnalysis'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<UserAnalysisSkeletonWithSidebar />}>
        <UserAnalysisPage />
      </Suspense>
    </ErrorBoundary>
  )
}
