import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Submission({
  params
}: {
  params: { assignmentId: string }
}) {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <SubmissionTable assignmentId={Number(params.assignmentId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
