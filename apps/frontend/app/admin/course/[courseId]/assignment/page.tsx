import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  AssignmentTable,
  AssignmentTableFallback
} from '../../_components/AssignmentTable'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params
  return (
    <div className="space-y-5">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <AssignmentTable groupId={courseId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
