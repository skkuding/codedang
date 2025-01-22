import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { UserTable, UserTableFallback } from './_components/UserTable'

export const dynamic = 'force-dynamic'

export default function User() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">User List</h1>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<UserTableFallback />}>
          <UserTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
