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
  params: { contestId: string }
}) {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ParticipantTableFallback />}>
        <ParticipantTable contestId={Number(params.contestId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
