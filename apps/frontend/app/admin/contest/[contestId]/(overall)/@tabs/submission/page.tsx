import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Submission({
  params
}: {
  params: { contestId: string }
}) {
  return (
    <Suspense fallback={<SubmissionTableFallback />}>
      <SubmissionTable contestId={Number(params.contestId)} />
    </Suspense>
  )
}
