import { Suspense } from 'react'
import {
  SubmissionPaginatedTable,
  SubmissionPaginatedTableFallback
} from './_components/SubmissionPaginatedTable'

export default function Submission({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params

  return (
    <Suspense fallback={<SubmissionPaginatedTableFallback />}>
      <SubmissionPaginatedTable problemId={Number(problemId)} />
    </Suspense>
  )
}
