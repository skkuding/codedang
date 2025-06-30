import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { FaCirclePlus } from 'react-icons/fa6'
import {
  AssignmentTable,
  AssignmentTableFallback
} from '../../_components/AssignmentTable'

export const dynamic = 'force-dynamic'

export default function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <p className="text-4xl font-bold">ASSIGNMENT LIST</p>
        <Button variant="default" asChild>
          <Link
            href={`/admin/course/${courseId}/assignment/create` as const}
            className="flex gap-1"
          >
            <FaCirclePlus />
            Create
          </Link>
        </Button>
      </div>
      <p className="text-lg text-slate-500">
        Here&apos;s a assignment list you made
      </p>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <AssignmentTable groupId={courseId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
