import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
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
        <div className="flex gap-2">
          <ProblemsUploadButton />
          <Button variant="default" className="w-[120px]" asChild>
            <Link href="/admin/problem/create">
              <HiMiniPlusCircle className="mr-2 h-5 w-5" />
              <span className="text-lg">Create</span>
            </Link>
          </Button>
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
