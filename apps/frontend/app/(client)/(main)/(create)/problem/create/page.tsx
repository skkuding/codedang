import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { ProblemCreateContainer } from './_components/ProblemCreateContainer'
import { ProblemCreateContainerSkeleton } from './_components/ProblemCreateSkeletons'

export default function ProblemCreatePage() {
  return (
    <div className="mt-15 flex w-full justify-center leading-6 tracking-[-0.03em]">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ProblemCreateContainerSkeleton />}>
          <ProblemCreateContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
