'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { UploadDialog } from '../_components/UploadDialog'
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
            Here&apos;s the problems shared by other users
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
