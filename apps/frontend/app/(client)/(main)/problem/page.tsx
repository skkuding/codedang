import { Suspense } from 'react'
import ProblemInfiniteTable, {
  ProblemInfiniteTableFallback
} from './_components/ProblemInfiniteTable'

export default function ProblemListPage() {
  return (
    /**TODO: add error boundary */
    <Suspense fallback={<ProblemInfiniteTableFallback />}>
      <ProblemInfiniteTable />
    </Suspense>
  )
}
