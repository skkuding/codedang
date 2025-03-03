'use client'

import { SubmissionAssessment } from '@/app/admin/course/[courseId]/grade/assignment/[assignmentId]/user/[userId]/problem/[problemId]/_components/SubmissionAssessment'
import { SubmissionSummary } from '@/app/admin/course/[courseId]/grade/assignment/[assignmentId]/user/[userId]/problem/[problemId]/_components/SubmissionSummary'
import { SubmissionTestcase } from '@/app/admin/course/[courseId]/grade/assignment/[assignmentId]/user/[userId]/problem/[problemId]/_components/SubmissionTestcase'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_ASSIGNMENT_SUBMISSION } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import type { SubmissionDetail } from '@generated/graphql'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'

interface PageProps {
  params: {
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }
}

export default function Page({ params }: PageProps) {
  const { courseId, assignmentId, userId, problemId } = params

  const submission = useSuspenseQuery(GET_ASSIGNMENT_SUBMISSION, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    }
  }).data?.getAssignmentSubmission

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <div className="z-20 flex items-center gap-3 px-6 pt-6">
        <h1 className="text-xl font-bold">Submission #{submission.id}</h1>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <div className="flex h-fit flex-col gap-4 px-8 text-lg">
              <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
              <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
            </div>
          }
        >
          <div className="px-6 py-4">
            <SubmissionSummary submission={submission as SubmissionDetail} />
          </div>

          <div className="h-3 bg-[#121728]" />

          <div className="px-6 py-2">
            <SubmissionTestcase submission={submission as SubmissionDetail} />
          </div>

          <div className="h-3 bg-[#121728]" />

          <div className="px-6 py-2">
            <SubmissionAssessment
              groupId={Number(courseId)}
              assignmentId={Number(assignmentId)}
              userId={Number(userId)}
              problemId={Number(problemId)}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
