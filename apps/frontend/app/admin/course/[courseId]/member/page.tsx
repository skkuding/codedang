import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Member List</h1>
      </div>
      <h1 className="text-lg font-normal text-gray-500">
        Here are all the instructors and members of the course.
      </h1>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<GroupTableFallback />}>
          <GroupTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
