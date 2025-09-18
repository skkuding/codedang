import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default async function SubmissionPage(props: {
  params: Promise<{ courseId: string; exerciseId: string; problemId: string }>
}) {
  const { courseId, exerciseId, problemId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable
          courseId={Number(courseId)}
          exerciseId={Number(exerciseId)}
          problemId={Number(problemId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
