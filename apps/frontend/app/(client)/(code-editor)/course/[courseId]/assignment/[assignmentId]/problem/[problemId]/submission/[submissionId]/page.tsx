import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { ArrowLeft } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { SubmissionDetail } from './_components/SubmissionDetail'
import { SubmissionDetailTitle } from './_components/SubmissionDetailTitle'

export default function Page({
  params
}: {
  params: {
    assignmentId: string
    courseId: string
    problemId: string
    submissionId: string
  }
}) {
  const { courseId, assignmentId, problemId, submissionId } = params

  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="z-20 flex items-center gap-3">
        <Link
          href={
            `course/${courseId}/assignment/${assignmentId}/problem/${problemId}/submission` as Route
          }
        >
          <ArrowLeft className="size-5" />
        </Link>
        <SubmissionDetailTitle
          problemId={Number(problemId)}
          assignmentId={Number(assignmentId)}
        />
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
          <SubmissionDetail
            problemId={Number(problemId)}
            assignmentId={Number(assignmentId)}
            submissionId={Number(submissionId)}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
