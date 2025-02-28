'use client'

import { SubmissionDetailPanel } from '@/app/admin/course/[courseId]/grade/_components/SubmissionDetailPanel'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_ASSIGNMENT_SUBMISSION } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import type { SubmissionDetail } from '@generated/graphql'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'

export default function Page({
  params
}: {
  params: {
    assignmentId: string
    userId: string
    problemId: string
  }
}) {
  const { assignmentId, userId, problemId } = params

  const submission = useSuspenseQuery(GET_ASSIGNMENT_SUBMISSION, {
    variables: {
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    }
  }).data?.getAssignmentSubmission

  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="z-20 flex items-center gap-3">
        <h1 className="text-xl font-bold">Submission #{submission.id}</h1>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <div className="flex h-fit flex-col gap-4 p-2 text-lg">
              <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
              <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
            </div>
          }
        >
          <SubmissionDetailPanel submission={submission as SubmissionDetail} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
