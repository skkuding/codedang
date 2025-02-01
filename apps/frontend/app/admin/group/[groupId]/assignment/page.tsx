import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  AssignmentTable,
  AssignmentTableFallback
} from './_components/AssignmentTable'

export const dynamic = 'force-dynamic'

export default function Page({ params }: { params: { groupId: string } }) {
  const { groupId } = params
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <p className="text-4xl font-bold">Assignment List</p>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        <Button variant="default" asChild>
          <Link href={`/admin/group/${groupId}/assignment/create` as const}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <AssignmentTable groupId={groupId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
