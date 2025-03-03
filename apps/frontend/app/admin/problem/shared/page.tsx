'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  SharedProblemTable,
  SharedProblemTableFallback
} from './_components/SharedProblemTable'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">Shared Problem List</p>
          <p className="flex text-lg text-slate-500">
            Here&apos;s the problems shared in other courses.
          </p>
        </div>
      </div>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<SharedProblemTableFallback />}>
          <SharedProblemTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
