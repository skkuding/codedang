import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Submission({
  params
}: {
  params: { constestId: string }
}) {
  return (
    <Suspense fallback={<SubmissionTableFallback />}>
      <SubmissionTable contestId={Number(params.constestId)} />
    </Suspense>
  )
}
