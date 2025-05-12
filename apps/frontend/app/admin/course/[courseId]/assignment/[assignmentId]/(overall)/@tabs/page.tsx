'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { KatexContent } from '@/components/KatexContent'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { useQuery } from '@apollo/client'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { ParticipantTableFallback } from './_components/ParticipantTable'

interface InformationProps {
  params: { courseId: string; assignmentId: string }
}

export default function Information({ params }: InformationProps) {
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(params.courseId),
      assignmentId: Number(params.assignmentId)
    }
  }).data?.getAssignment
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ParticipantTableFallback />}>
        <div>
          <KatexContent
            content={assignmentData?.description}
            classname="mb-4 w-full max-w-full border-y-gray-300"
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
