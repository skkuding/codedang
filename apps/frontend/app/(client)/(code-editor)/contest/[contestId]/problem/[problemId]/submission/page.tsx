import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default async function SubmissionPage(props: {
  params: Promise<{ problemId: string; contestId: string }>
}) {
  const { problemId, contestId } = await props.params

  return (
    <TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionPaginatedTableFallback />}>
        <SubmissionPaginatedTable
          problemId={Number(problemId)}
          contestId={Number(contestId)}
        />
      </Suspense>
    </TanstackQueryErrorBoundary>
  )
}
