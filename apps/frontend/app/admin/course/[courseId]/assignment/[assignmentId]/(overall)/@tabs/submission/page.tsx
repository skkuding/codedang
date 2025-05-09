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
          {/* 겹치는 내용이 많아보여서, 추후 리팩토링할때 활용할 수 있을 것 같아 지우지 않았습니다! (민규) */}
          {/* <SubmissionTable
            groupId={Number(params.courseId)}
            assignmentId={Number(params.assignmentId)}
          /> */}
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
