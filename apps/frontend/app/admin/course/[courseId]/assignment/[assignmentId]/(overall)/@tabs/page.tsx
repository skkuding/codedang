import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  ParticipantTable,
  ParticipantTableFallback
} from './_components/ParticipantTable'

export default function Submission({
  params
}: {
  params: { assignmentId: string }
}) {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ParticipantTableFallback />}>
        <ParticipantTable assignmentId={Number(params.assignmentId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
