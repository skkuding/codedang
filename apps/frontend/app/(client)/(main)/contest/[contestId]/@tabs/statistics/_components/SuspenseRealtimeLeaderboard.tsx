import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { RealtimeLearBoardPage } from './RealtimeLeaderBoard'

export function SuspenseRealtimeLeaderboard() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense
        fallback={
          <>
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
          </>
        }
      >
        <RealtimeLearBoardPage />
      </Suspense>
    </ErrorBoundary>
  )
}
