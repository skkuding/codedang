import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default async function Submission(props: {
  params: Promise<{ contestId: string }>
}) {
  const params = await props.params
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <SubmissionTable contestId={Number(params.contestId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
