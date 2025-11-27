'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { ProblemTabs } from '../_components/ProblemTabs'
import {
  SharedProblemTable,
  SharedProblemTableFallback
} from './_components/SharedProblemTable'

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">SHARED PROBLEM LIST</p>
          <p className="flex text-lg text-slate-500">
            Here&apos;s a problem list shared in other courses.
          </p>
        </div>
      </div>
      <ProblemTabs />

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<SharedProblemTableFallback />}>
          <SharedProblemTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
