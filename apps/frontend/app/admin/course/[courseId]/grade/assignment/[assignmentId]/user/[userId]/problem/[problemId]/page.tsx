'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'

export default function Page({
  params
}: {
  params: {
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }
}) {
  const { courseId, assignmentId, userId, problemId } = params

  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="z-20 flex items-center gap-3">
        {/* <h1 className="text-xl font-bold">Submission #{submissionId}</h1> */}
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <div className="flex h-fit flex-col gap-4 p-2 text-lg">
              <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
              <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
            </div>
          }
        >
          디테일~
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
