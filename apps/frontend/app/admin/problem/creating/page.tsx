'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CreateProblemEntry } from '../_components/CreateProblemEntry'
import { ProblemTabs } from '../_components/ProblemTabs'
import { ProblemsUploadButton } from '../_components/ProblemsUploadButton'
import {
  SharedProblemTable,
  SharedProblemTableFallback
} from './_components/CreatingProblemTable'

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">CREATING PROBLEM LIST</p>
          <p className="flex text-lg text-slate-500">
            Here&apos;s a problem list creating on the way.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProblemsUploadButton />
          <CreateProblemEntry />
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
