'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { PlagiarismResultTable } from './_components/PlagiarismResultTable'

export default function PlagiarismCheckPage() {
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  )

  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <PlagiarismResultTable
            selectedProblemId={selectedProblemId}
            onProblemSelect={setSelectedProblemId}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
