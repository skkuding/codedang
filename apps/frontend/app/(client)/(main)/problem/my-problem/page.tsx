import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import { MyProblem, MyProblemFallback } from '../_components/MyProblem'

export default function MyProblemsPage() {
  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<MyProblemFallback />}>
        <MyProblem />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
