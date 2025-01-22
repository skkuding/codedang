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
  params: { contestId: string }
}) {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <SubmissionTable contestId={Number(params.contestId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
