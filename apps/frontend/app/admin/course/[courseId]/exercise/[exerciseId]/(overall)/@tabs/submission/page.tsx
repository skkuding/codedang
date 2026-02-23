'use client'

import { ParticipantTable } from '@/app/admin/course/[courseId]/_components/ParticipantTable'
import {
  SubmissionTable,
  SubmissionTableFallback
} from '@/app/admin/course/[courseId]/_components/SubmissionTable'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { cn } from '@/libs/utils'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense, useState, use } from 'react'

export default function Submission(props: {
  params: Promise<{ courseId: string; exerciseId: string }>
}) {
  const { t } = useTranslate()
  const params = use(props.params)
  const [tab, setTab] = useState<'all' | 'students'>('all')
  const groupId = Number(params.courseId)
  const exerciseId = Number(params.exerciseId)

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
                {t('all_submissions_button')}
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
                {t('students_button')}
              </button>
            </div>
          </div>
          {tab === 'all' ? (
            <SubmissionTable groupId={groupId} assignmentId={exerciseId} />
          ) : (
            <ParticipantTable isExercise={true} />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
