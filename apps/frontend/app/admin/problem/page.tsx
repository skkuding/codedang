import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CreateProblemEntry } from './_components/CreateProblemEntry'
import { ProblemTable, ProblemTableFallback } from './_components/ProblemTable'
import { ProblemTabs } from './_components/ProblemTabs'
import { ProblemsUploadButton } from './_components/ProblemsUploadButton'

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">MY PROBLEM LIST</p>
          <p className="flex text-lg text-slate-500">
            Here&apos;s a problem list you made
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProblemsUploadButton />
          <CreateProblemEntry />
        </div>
      </div>
      <ProblemTabs />
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ProblemTableFallback />}>
          <ProblemTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
