import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Submission({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<SubmissionTableFallback />}>
      <SubmissionTable contestId={Number(params.id)} />
    </Suspense>
  )
}
