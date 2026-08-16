import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'

export default function Page() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<GroupTableFallback />}>
        <div className="space-y-2">
          <GroupTable />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
