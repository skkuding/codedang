import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { ProblemTable, ProblemTableFallback } from './_components/ProblemTable'
import { ProblemTabs } from './_components/ProblemTabs'
import { UploadDialog } from './_components/UploadDialog'

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">My Problem List</p>
          <p className="flex text-lg text-slate-500">
            Here&apos;s a list you made
          </p>
        </div>
        <div className="flex gap-2">
          <UploadDialog />
          <Link href="/admin/problem/create">
            <Button variant="default">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create
            </Button>
          </Link>
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
