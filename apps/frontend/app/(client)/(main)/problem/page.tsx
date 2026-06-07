import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import { ProblemTable, ProblemTableFallback } from './_components/ProblemTable'

export default function ProblemListPage() {
  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ProblemTableFallback />}>
        <ProblemTable />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
