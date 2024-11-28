import FetchErrorFallback from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import ProblemInfiniteTable, {
  ProblemInfiniteTableFallback
} from './_components/ProblemInfiniteTable'

export default function ProblemListPage() {
  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ProblemInfiniteTableFallback />}>
        <ProblemInfiniteTable />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
