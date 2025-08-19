'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { cn } from '@/libs/utils'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState, use } from 'react'
import { ParticipantTable } from '../../../../../_components/ParticipantTable'
import {
  SubmissionTable,
  SubmissionTableFallback
} from '../../../../../_components/SubmissionTable'

export default function Submission(props: {
  params: Promise<{ courseId: string; assignmentId: string }>
}) {
  const params = use(props.params)
  const [tab, setTab] = useState<'all' | 'students'>('all')
  const groupId = Number(params.courseId)
  const assignmentId = Number(params.assignmentId)

  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <div>
          <div className="mb-4 flex justify-start">
            <div className="flex gap-1 rounded-full bg-gray-200 p-1">
              <button
                className={cn(
                  'rounded-full px-4 py-1 font-semibold transition-colors',
                  tab === 'all'
                    ? 'text-primary bg-white'
                    : 'bg-transparent text-gray-700'
                )}
                onClick={() => setTab('all')}
              >
                All submissions
              </button>
              <button
                className={cn(
                  'rounded-full px-4 py-1 font-semibold transition-colors',
                  tab === 'students'
                    ? 'text-primary bg-white'
                    : 'bg-transparent text-gray-700'
                )}
                onClick={() => setTab('students')}
              >
                Students
              </button>
            </div>
          </div>
          {tab === 'all' ? (
            <SubmissionTable groupId={groupId} assignmentId={assignmentId} />
          ) : (
            <ParticipantTable />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
