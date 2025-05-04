import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { ParticipantTable } from '../_components/ParticipantTable'
import { SubmissionTableFallback } from './_components/SubmissionTable'

export default function Submission() {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <div>
          <ParticipantTable />
          {/* <SubmissionTable
            groupId={Number(params.courseId)}
            assignmentId={Number(params.assignmentId)}
          /> */}
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
