import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default function SubmissionPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { problemId, contestId } = params

  return (
    <Suspense fallback={<SubmissionPaginatedTableFallback />}>
      <SubmissionPaginatedTable
        problemId={Number(problemId)}
        contestId={Number(contestId)}
      />
    </Suspense>
  )
}
