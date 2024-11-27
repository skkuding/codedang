import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import ProblemInfiniteTable, {
  ProblemInfiniteTableErrorFallback,
  ProblemInfiniteTableFallback
} from './_components/ProblemInfiniteTable'

export default function ProblemListPage() {
  return (
    <TanstackQueryErrorBoundary fallback={ProblemInfiniteTableErrorFallback}>
      <Suspense fallback={<ProblemInfiniteTableFallback />}>
        <ProblemInfiniteTable />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
