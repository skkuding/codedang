import { Suspense } from 'react'
import {
  ParticipantTable,
  ParticipantTableFallback
} from './_components/ParticipantTable'

export default function Submission({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ParticipantTableFallback />}>
      <ParticipantTable contestId={Number(params.id)} />
    </Suspense>
  )
}
