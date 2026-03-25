'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { NoticeDetailView } from './_components/NoticeDetailView'

export default function NoticeDetailPage() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense
        fallback={
          <div className="mt-20 flex min-h-[80vh] flex-col gap-5 pl-10 pr-[116px]">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        }
      >
        <NoticeDetailView />
      </Suspense>
    </ErrorBoundary>
  )
}
