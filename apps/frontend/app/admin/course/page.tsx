'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CreateCourseButton } from './_components/CreateCourseButton'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Course List</h1>
        <CreateCourseButton />
      </div>
      <h1 className="text-lg font-normal text-gray-500">
        Here’s a course list you made
      </h1>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<GroupTableFallback />}>
          <GroupTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
