'use client'

import { QnaDetailView } from '@/app/(client)/(main)/course/[courseId]/_components/QnaDetailView'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary, Suspense } from '@suspensive/react'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense
        fallback={
          <div className="flex min-h-[80vh] flex-col items-center justify-center gap-5 pl-4 pr-[116px]">
            <Skeleton className="h-30 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
            <Skeleton className="h-30 w-full rounded-xl" />
          </div>
        }
      >
        <QnaDetailView />
      </Suspense>
    </ErrorBoundary>
  )
}
