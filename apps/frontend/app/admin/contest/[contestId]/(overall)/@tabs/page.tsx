import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  ParticipantTable,
  ParticipantTableFallback
} from './_components/ParticipantTable'

export default async function Submission(props: {
  params: Promise<{ contestId: string }>
}) {
  const params = await props.params
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ParticipantTableFallback />}>
        <ParticipantTable contestId={Number(params.contestId)} />
      </Suspense>
    </ErrorBoundary>
  )
}
