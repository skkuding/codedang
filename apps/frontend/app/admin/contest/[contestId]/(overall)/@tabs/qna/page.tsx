import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  ContestQnaTable,
  ContestQnaTableFallback
} from './_components/ContestQnaTable'

export default function AdminContestQna() {
  return (
    <div className="flex w-full">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ContestQnaTableFallback />}>
          <ContestQnaTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
